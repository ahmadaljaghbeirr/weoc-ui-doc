/**
 * webeoc-dynamic-list-filters.js
 *
 * Centralises all search, filter, and clear logic for WebEOC Nexus display pages.
 *
 * Auto-initializes on document ready:
 *   - Dynamic list-based filter selects  (select[id$="-filter"])
 *   - Static Tom Select dropdowns        (.tomselect:not([data-list]):not([data-sort]))
 *   - Sort controls                      (select[data-sort="true"] + direction group)
 *   - Date range pickers                 (.flat-range-start / .flat-range-end)
 *
 * Each dynamic filter select must carry:
 *   data-list        (optional) WebEOC Nexus list name (GetList API). Omit when using static <option> elements.
 *   data-field       WebEOC field name for BoardScript.ApplyOrFilter (or the range search field)
 *   data-placeholder Dropdown placeholder text
 *   data-parent      (optional) ID of the parent filter select
 *
 * For numeric range filters (no data-list), also set:
 *   data-range="true"      flags this select for range-based filtering
 *   data-search-id         id of the matching <search range="true"> tag in the hidden div;
 *                          populates searchfrom_<id> / searchto_<id> hidden inputs.
 *                          Option values must be "min:max" (e.g. "1:50", "501:" for open-ended).
 *
 * Each sort control is a single-select carrying:
 *   data-sort="true" marks it as a sort picker (option values = field names)
 *   data-placeholder Dropdown placeholder text
 *   plus a paired direction group:
 *     <div data-sort-for="<select id>"> with input[data-sort-dir="asc"|"desc"]
 *   Picking a field or toggling a direction calls BoardScript.SortByField immediately.
 *
 * Dropdown slots (any select): render custom markup inside the dropdown via
 *   data-dropdown-header="#id"  and/or  data-dropdown-footer="#id"
 *   pointing at a staged <div class="ts-dropdown-slot">…</div>. The node is
 *   moved into the dropdown (header pinned above the option list, footer below).
 *   Mechanism lives in tom-select-factory.js; the sort control uses it to host
 *   its direction cards as a sticky header.
 *
 * Override the API base URL by setting window.WEBEOC_API_BASE_URL before load.
 *
 * Public API:
 *   window.initDynamicSearchBar(placeholder)  — call from initialize() with page placeholder
 *   window.initSortControls()                 — auto-called; re-call after injecting sort markup
 *   window.clearDynamicFilters()              — call from clearBtn() onclick
 */

(function ($) {
  "use strict";

  if (typeof $ === "undefined") {
    console.error("[DynamicFilters] jQuery is required but was not found.");
    return;
  }

  // In-memory list cache keyed by list name
  var _listCache = {};

  // Debounce timer IDs keyed by select element ID
  var _debounceTimers = {};

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  function debounce(fn, delay) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, delay); };
  }

  // ---------------------------------------------------------------------------
  // GetList API
  // ---------------------------------------------------------------------------

  /**
   * Fetch a WebEOC Nexus list by name via the GetList API.
   * Results are cached so the same list is only requested once.
   * Returns a jQuery Deferred promise.
   */
  function getListData(listName) {
    if (_listCache[listName]) {
      return $.Deferred().resolve(_listCache[listName]).promise();
    }

    var url = "../api/rest.svc/lists/" + encodeURIComponent(listName);

    return $.ajax({
      url: url,
      method: "GET",
      contentType: "application/json",
    })
      .done(function (data) {
        _listCache[listName] = data;
      })
      .fail(function (xhr) {
        console.warn(
          '[DynamicFilters] Failed to load list "' + listName + '": ' +
          xhr.status + " " + xhr.statusText
        );
      });
  }

  // ---------------------------------------------------------------------------
  // List traversal
  // ---------------------------------------------------------------------------

  /**
   * Recursively search nested subitems for an item whose name matches.
   * Returns the item object or null if not found.
   */
  function findItemByName(items, name) {
    if (!items || !items.length || !name) return null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === name) return items[i];
      var found = findItemByName(items[i].subitems, name);
      if (found) return found;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Value helpers
  // ---------------------------------------------------------------------------

  /**
   * Return the current selected values of a <select> as an array.
   * Handles both single and multiple selects.
   */
  function getSelectedValues($select) {
    var val = $select.val();
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  // ---------------------------------------------------------------------------
  // Tom Select management
  // ---------------------------------------------------------------------------

  /**
   * Initialize (or re-initialize) Tom Select on a given <select> element.
   * An existing instance is destroyed first.
   * Wires up onChange/onClear to apply filters and cascade child rebuilds.
   */
  function initTomSelect($select) {
    var el = $select[0];

    if (el.tomselect) {
      el.tomselect.destroy();
    }

    var config = {
      allowEmptyOption: false,
      placeholder: $select.data("placeholder") || "Select...",
      plugins: ["dropdown_input", "clear_button"],
      onChange: function () {
        applyFilterDebounced($select);
        rebuildChildren($select);
      },
      onClear: function () {
        applyFilterDebounced($select);
        rebuildChildren($select);
      },
    };

    if ($select.prop("multiple")) {
      config.maxItems = null;
      config.plugins.push("remove_button");
    }

    var ts = new TomSelect(el, config);
    mountDropdownSlots(ts, el);
  }

  /**
   * Minimal TomSelect init for range filter selects (.tomselect-range).
   * Options are lifted from the static HTML via safe DOM properties (el.text /
   * el.value), then the native options are removed and TomSelect receives a
   * plain JS array — avoids the innerHTML.trim() error on XSLT-rendered nodes.
   */
  function initRangeSelect($select) {
    var el = $select[0];
    if (el.tomselect) el.tomselect.destroy();

    var opts = [];
    $select.find('option').each(function () {
      opts.push({ value: this.value, text: this.text || this.textContent || '' });
    });
    $select.empty();

    new TomSelect(el, {
      options: opts,
      allowEmptyOption: true,
      placeholder: $select.data('placeholder') || 'Select...',
      plugins: ['clear_button'],
      onChange: function () { applyFilterDebounced($select); },
      onClear:  function () { applyFilterDebounced($select); },
    });
  }

  // ---------------------------------------------------------------------------
  // Dropdown slots — factory-preferred, with inline fallback
  // ---------------------------------------------------------------------------
  //
  // Selects opt in via data-dropdown-header / data-dropdown-footer pointing at
  // a staged <div class="ts-dropdown-slot">. The factory is preferred (single
  // source of truth); if it is absent or lacks mountDropdownSlots, the inline
  // fallback performs the identical operation so sort controls always work.

  function mountDropdownSlots(ts, el) {
    if (typeof TomSelectFactory !== "undefined" &&
        TomSelectFactory && typeof TomSelectFactory.mountDropdownSlots === "function") {
      TomSelectFactory.mountDropdownSlots(ts, el);
      return;
    }

    // Fallback: factory not loaded or outdated — mount directly.
    if (!ts || !ts.dropdown || !el) return;
    ['header', 'footer'].forEach(function (slot) {
      var sel = el.getAttribute('data-dropdown-' + slot);
      if (!sel) return;
      var node = document.querySelector(sel);
      if (!node || node.__tsMounted) return;

      node.classList.remove('ts-dropdown-slot');
      node.classList.add('ts-dropdown-' + slot);
      if (slot === 'header') ts.dropdown.insertBefore(node, ts.dropdown.firstChild);
      else ts.dropdown.appendChild(node);

      // Keep TomSelect focused (prevent dropdown close) while interacting with the slot.
      node.addEventListener('mousedown', function (e) {
        e.stopPropagation();
        if (!e.target.closest('input:not([type="radio"]):not([type="checkbox"]),textarea,select,[contenteditable]')) {
          e.preventDefault();
        }
      });
      // Labels wrapping radio/checkbox: cancel activation to prevent focus theft.
      node.querySelectorAll('label').forEach(function (lbl) {
        var inp = lbl.querySelector('input[type="radio"],input[type="checkbox"]');
        if (!inp) return;
        lbl.addEventListener('click', function (e) {
          if (e.target === inp) return;
          e.preventDefault();
          e.stopPropagation();
          if (inp.type === 'radio') inp.checked = true;
          else inp.checked = !inp.checked;
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      node.querySelectorAll('input[type="radio"],input[type="checkbox"]').forEach(function (inp) {
        inp.addEventListener('click', function (e) { e.stopPropagation(); });
      });
      node.addEventListener('click', function (e) { e.stopPropagation(); });
      node.__tsMounted = true;
    });
  }

  // ---------------------------------------------------------------------------
  // Option population
  // ---------------------------------------------------------------------------

  /**
   * Destroy Tom Select, replace <option> elements with the supplied items,
   * then re-initialize Tom Select.
   * items: array of { name, color, subitems } from the WebEOC list response.
   */
  function populateSelect($select, items) {
    var el = $select[0];

    if (el.tomselect) {
      el.tomselect.destroy();
    }

    $select.empty();
    // Blank first option lets Tom Select show the placeholder instead of pre-selecting item 1
    $select.append($('<option>', { value: '', text: '' }));

    if (items && items.length) {
      $.each(items, function (_, item) {
        $select.append($("<option>", { value: item.name, text: item.name }));
      });
    }

    initTomSelect($select);
  }

  /**
   * Populate a child select whose options depend on a parent item's subitems.
   * When parentValue is empty the child is left enabled but empty.
   */
  function populateChildSelect($child, parentValue, listData) {
    if (!parentValue) {
      populateSelect($child, []);
      return;
    }

    var parentItem = findItemByName(listData.subitems, parentValue);
    var childItems = parentItem && parentItem.subitems ? parentItem.subitems : [];
    populateSelect($child, childItems);
  }

  // ---------------------------------------------------------------------------
  // Filter application
  // ---------------------------------------------------------------------------

  /**
   * Apply a numeric range filter using the <search range="true"> mechanism.
   * Uses data-field to derive searchfrom_<field> / searchto_<field> inputs
   * (matches the <search range="true" id="<FieldName>" field="<FieldName>" />
   * pattern — search input IDs equal the field name).
   * Option values must be "min:max" (e.g. "1:50") or "min:" for open-ended.
   */
  function applyRangeFilter($select) {
    var fieldName = $select.data("field");
    if (!fieldName) {
      console.warn("[DynamicFilters] Missing data-field on #" + $select.attr("id") + ". Range filter not applied.");
      return;
    }
    var ts = $select[0].tomselect;
    var val = (ts ? ts.getValue() : $select.val()) || "";
    var parts = val.split(":");
    var min = parts[0] !== undefined ? parts[0] : "";
    var max = parts[1] !== undefined ? parts[1] : "";
    $("#searchfrom_" + fieldName).val(min);
    $("#searchto_" + fieldName).val(max);
    $('span[button="search-button"] input[type="button"]').click();
  }

  /**
   * Apply the WebEOC OR filter for a given <select> element immediately.
   * Selects with class tomselect-range are routed to applyRangeFilter instead.
   */
  function applyFilter($select) {
    if ($select.hasClass('tomselect-range')) {
      applyRangeFilter($select);
      return;
    }
    var fieldName = $select.data("field");
    if (!fieldName) {
      console.warn(
        "[DynamicFilters] Missing data-field on #" + $select.attr("id") + ". Filter not applied."
      );
      return;
    }
    if (typeof BoardScript === "undefined" || typeof BoardScript.ApplyOrFilter !== "function") {
      console.warn("[DynamicFilters] BoardScript.ApplyOrFilter is not available.");
      return;
    }
    BoardScript.ApplyOrFilter(fieldName, getSelectedValues($select));
  }

  /**
   * Debounced wrapper around applyFilter (250 ms).
   */
  function applyFilterDebounced($select) {
    var id = $select.attr("id");
    if (_debounceTimers[id]) clearTimeout(_debounceTimers[id]);
    _debounceTimers[id] = setTimeout(function () {
      applyFilter($select);
    }, 250);
  }

  // ---------------------------------------------------------------------------
  // Sort application (BoardScript.SortByField)
  // ---------------------------------------------------------------------------

  /**
   * Read the chosen direction for a sort select from its paired
   * [data-sort-for="<id>"] group. Defaults to "asc" when nothing is checked.
   * Only "asc" / "desc" are valid; anything else falls back to "asc".
   */
  function getSortDirection($select) {
    var id = $select.attr("id");
    var checked = $('[data-sort-for="' + id + '"]')
      .find('input[data-sort-dir]:checked').first();
    var dir = checked.length ? String(checked.attr("data-sort-dir")) : "";
    return dir === "desc" ? "desc" : "asc";
  }

  /**
   * Apply BoardScript.SortByField for a sort <select>. The selected option
   * value is the WebEOC field name; direction comes from the paired radio group.
   * No field selected -> no-op (nothing to sort by yet).
   */
  function applySort($select) {
    var field = $select.val() || "";
    if (!field) return;
    if (typeof BoardScript === "undefined" || typeof BoardScript.SortByField !== "function") {
      console.warn("[DynamicFilters] BoardScript.SortByField is not available.");
      return;
    }
    BoardScript.SortByField(field, getSortDirection($select));
  }

  /**
   * Sort by the select's data-default-sort field (data-default-sort-dir, else "desc").
   * Also resets the direction radio to match. Called on onClear and clearDynamicFilters.
   * No-op if data-default-sort is not set or BoardScript is unavailable.
   */
  function applyDefaultSort(el) {
    var $select = $(el);
    var field = $select.data("default-sort") || "";
    var dir   = $select.data("default-sort-dir") || "desc";
    if (!field) return;
    if (typeof BoardScript === "undefined" || typeof BoardScript.SortByField !== "function") return;
    // Sync the direction radio so the UI matches what we're about to apply
    var id = el.id;
    $('[data-sort-for="' + id + '"]').find('input[data-sort-dir="' + dir + '"]').prop("checked", true);
    BoardScript.SortByField(field, dir);
  }

  // ---------------------------------------------------------------------------
  // Parent-child cascade
  // ---------------------------------------------------------------------------

  /**
   * Rebuild every child select whose data-parent equals the given select's ID.
   * Clears the child silently, re-populates from the list, applies the empty
   * filter, then recurses to grandchildren.
   */
  function rebuildChildren($parent) {
    var parentId = $parent.attr("id");
    var singleValue = getSelectedValues($parent)[0] || "";

    $('select[id$="-filter"][data-parent="' + parentId + '"]').each(function () {
      var $child = $(this);
      var listName = $child.data("list");

      if (!listName) {
        console.warn(
          "[DynamicFilters] Missing data-list on #" + $child.attr("id") + ". Child not rebuilt."
        );
        return;
      }

      getListData(listName).done(function (data) {
        if (!data) return;
        if ($child[0].tomselect) $child[0].tomselect.clear(true);
        populateChildSelect($child, singleValue, data);
        applyFilter($child);
        rebuildChildren($child);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Dynamic filter selects init
  // ---------------------------------------------------------------------------

  /**
   * Discover all select[id$="-filter"] elements, load their WebEOC list data,
   * populate options, and wire up Tom Select with automatic filter application.
   */
  function initDynamicWebEOCFilters() {
    var $allFilters = $('select[id$="-filter"]');
    if (!$allFilters.length) return;

    var $topLevel = $allFilters.filter(function () { return !$(this).data("parent"); });
    var $children = $allFilters.filter(function () { return !!$(this).data("parent"); });

    $topLevel.each(function () {
      var $select = $(this);
      var listName = $select.data("list");

      if (!listName) {
        // No data-list: static <option> elements already in DOM.
        // Range selects (.tomselect-range) get a programmatic init that lifts
        // options out of the DOM before TomSelect touches them, avoiding the
        // innerHTML.trim() error on XSLT-rendered option nodes.
        if ($select.hasClass('tomselect-range')) {
          initRangeSelect($select);
        } else {
          initTomSelect($select);
        }
        return;
      }

      getListData(listName)
        .done(function (data) {
          if (!data) {
            initTomSelect($select);
            return;
          }

          populateSelect($select, data.subitems || []);

          $children
            .filter(function () { return $(this).data("parent") === $select.attr("id"); })
            .each(function () {
              var $child = $(this);
              var childListName = $child.data("list");

              if (!childListName) {
                console.warn(
                  "[DynamicFilters] Missing data-list on #" + $child.attr("id") + ". Initializing without options."
                );
                initTomSelect($child);
                return;
              }

              getListData(childListName)
                .done(function (childData) {
                  if (!childData) { initTomSelect($child); return; }
                  populateChildSelect($child, "", childData);
                })
                .fail(function () { initTomSelect($child); });
            });
        })
        .fail(function () { initTomSelect($select); });
    });
  }

  // ---------------------------------------------------------------------------
  // Card group (boolean checkbox) filter init
  // ---------------------------------------------------------------------------

  /**
   * Wire up card group boolean checkbox filters.
   * Any element carrying data-card-filter-field="<FieldName>" is treated as a
   * group: its input[type="checkbox"] values are collected on change and passed
   * to BoardScript.ApplyOrFilter. Empty selection → [] (clears the filter).
   * Auto-called on document ready.
   */
  function initCardGroupFilters() {
    $('[data-card-filter-field]').each(function () {
      var $group = $(this);
      var field  = $group.data('card-filter-field');
      if (!field) return;

      $group.find('input[type="checkbox"]').off('change.cardGroupFilter').on('change.cardGroupFilter', function () {
        var values = [];
        $group.find('input[type="checkbox"]:checked').each(function () {
          values.push(String(this.value));
        });
        if (typeof BoardScript !== 'undefined' && typeof BoardScript.ApplyOrFilter === 'function') {
          BoardScript.ApplyOrFilter(field, values);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Date range filter helpers
  // ---------------------------------------------------------------------------

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function formatForWebEOC(date) {
    if (!date) return '';
    return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear() +
           ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':00';
  }

  // ISO formatter for fields stored as YYYY-MM-DD HH:mm (e.g. future-datetime preset).
  // Used when the .wui-date-range-wrap carries data-range-fmt="iso".
  function fmtISO(date, endOfDay) {
    if (!date) return '';
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) +
           ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + (endOfDay ? '59' : '00');
  }

  function getRangePartner(element, selector) {
    var el = $(element).closest('.wui-date-range-wrap').find(selector)[0];
    return el && el._flatpickr ? el._flatpickr : null;
  }

  function syncDateRangeToWebEOC() {
    var startEl = $('.flat-range-start')[0];
    var endEl   = $('.flat-range-end')[0];
    var sd = startEl && startEl._flatpickr && startEl._flatpickr.selectedDates[0] || null;
    var ed = endEl   && endEl._flatpickr   && endEl._flatpickr.selectedDates[0]   || null;
    var wrapper = startEl && startEl.closest('.wui-date-range-wrap');
    var iso     = wrapper && wrapper.dataset.rangeFmt === 'iso';
    $('[id^="searchfrom_"]').val(iso ? fmtISO(sd, false) : formatForWebEOC(sd));
    $('[id^="searchto_"]').val(  iso ? fmtISO(ed, true)  : formatForWebEOC(ed));
    $('span[button="search-button"] input[type="button"]').click();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show the WebEOC search bar, set its placeholder, wire up the debounced
   * search input handler with spinner feedback, and clean stray "to" text nodes.
   * Call from the page's initialize() with a page-specific placeholder string.
   */
  window.initDynamicSearchBar = function (placeholder) {
    $('#search-bar').show();
    $('[name*="searchfield_"]')
      .attr('placeholder', placeholder || 'Search...')
      .addClass('wui-filter-search-filter');

    $('[name*="searchfrom_"]').each(function () {
      $(this).parent().contents().filter(function () {
        return this.nodeType === 3 && this.nodeValue.trim() === 'to';
      }).remove();
    });

    var runSearch = debounce(function () {
      $('span[button="search-button"] input[type="button"]').click();
      $('#search-status-icon').text('check_circle').css({ color: 'green' }).removeClass('spin');
    }, 1500);

    $('[id^="searchfield_"]').off('input.dynamicSearch').on('input.dynamicSearch', function () {
      $('#search-icon').hide();
      $('#search-status-icon')
        .text('autorenew')
        .css({ color: 'var(--color-text-secondary)', display: 'inline-block' })
        .addClass('spin');
      runSearch();
    });
  };

  /**
   * Initialize Tom Select on all static .tomselect elements that are not
   * managed by the dynamic filter system (i.e. no data-list attribute).
   * Auto-called on document ready — no need to call from the page.
   */
  window.initDynamicSelects = function () {
    $('.tomselect:not([data-list]):not([data-sort]):not(.tomselect-range)').each(function () {
      if (this.tomselect) return;
      var ts = new TomSelect(this, {
        allowEmptyOption: false,
        placeholder: this.dataset.placeholder || 'Select...',
        plugins: ['dropdown_input'],
      });
      mountDropdownSlots(ts, this);
    });
  };

  /**
   * Initialize sort controls. A sort control is a single-select carrying
   * data-sort="true" whose option values are WebEOC field names, paired with a
   * direction radio group: [data-sort-for="<select id>"] containing
   * input[type="radio"][data-sort-dir="asc"|"desc"].
   *
   * Picking a field OR changing the direction calls BoardScript.SortByField
   * immediately. Native radios keep the direction mutually exclusive; "asc" is
   * the default when the markup pre-checks nothing.
   *
   * Auto-called on document ready. Re-call after injecting sort markup late.
   *
   * Note: WebEOC exposes no "unsort" API, so clearing the field select stops
   * re-applying but does not restore the board's default order.
   */
  window.initSortControls = function () {
    $('select[data-sort="true"]').each(function () {
      var $select = $(this);
      var el = this;
      var id = $select.attr('id');

      if (!el.tomselect) {
        // No dropdown_input: the field list is short + static, and the dropdown
        // header (direction cards) is the primary control here.
        new TomSelect(el, {
          allowEmptyOption: false,
          placeholder: $select.data('placeholder') || 'Sort by...',
          plugins: ['clear_button'],
          maxItems: 1,
          closeAfterSelect: el.dataset.stayOpen !== 'true',
          onChange: function () { applySort($select); },
          onClear: function () { applyDefaultSort(el); },
        });
      }

      // Mount the direction picker (data-dropdown-header) into the dropdown.
      mountDropdownSlots(el.tomselect, el);

      var $dirs = $('[data-sort-for="' + id + '"]').find('input[data-sort-dir]');
      if (!$dirs.length) return;

      // Default to ascending when nothing is pre-checked in the markup.
      if (!$dirs.filter(':checked').length) {
        $dirs.filter('[data-sort-dir="asc"]').prop('checked', true);
      }

      // Radios are mutually exclusive natively — just re-sort on change.
      $dirs.off('change.dynamicSort').on('change.dynamicSort', function () {
        applySort($select);
      });
    });
  };

  /**
   * Initialize the flatpickr date range pickers (.flat-range-start / .flat-range-end),
   * wire them together so start ≤ end is enforced, and sync to WebEOC on change.
   * Auto-called on document ready — no need to call from the page.
   */
  window.initDynamicDateRangeFilter = function () {
    if (typeof flatpickr === 'undefined') {
      console.warn('[DynamicFilters] flatpickr not found. Date range filter not initialized.');
      return;
    }

    flatpickr('.flat-range-end', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:S',
      onOpen: function (_d, _s, instance) {
        var start = getRangePartner(instance.element, '.flat-range-start');
        if (start) instance.set('minDate', start.selectedDates[0] || null);
      },
      onChange: function (selectedDates, _s, instance) {
        var start = getRangePartner(instance.element, '.flat-range-start');
        if (!start) return;
        var end = selectedDates[0];
        if (end && start.selectedDates[0] && start.selectedDates[0] > end) {
          start.setDate(end, false);
        }
        start.set('maxDate', end || null);
        syncDateRangeToWebEOC();
      },
    });

    flatpickr('.flat-range-start', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:S',
      onOpen: function (_d, _s, instance) {
        var end = getRangePartner(instance.element, '.flat-range-end');
        if (end) instance.set('maxDate', end.selectedDates[0] || null);
      },
      onChange: function (selectedDates, _s, instance) {
        var end = getRangePartner(instance.element, '.flat-range-end');
        if (!end) return;
        var start = selectedDates[0];
        if (!start) {
          end.set('minDate', 'today');
          return;
        }
        if (end.selectedDates[0] && end.selectedDates[0] < start) {
          end.setDate(start, false);
        }
        end.set('minDate', start);
        syncDateRangeToWebEOC();
      },
    });
  };

  /**
   * Clear everything: dynamic filter selects, all Tom Select instances,
   * WebEOC search inputs, date range pickers, search icons, and trigger the
   * WebEOC clearsearch button to refresh the view.
   */
  window.clearDynamicFilters = function () {
    // Snapshot which sort selects are active before clearing — used in step 7.5.
    var activeSortIds = {};
    $('select[data-sort="true"]').each(function () {
      activeSortIds[this.id] = this.tomselect ? !!this.tomselect.getValue() : !!this.value;
    });

    // 1. Silently clear all Tom Select instances on the page
    $('.tomselect').each(function () {
      if (this.tomselect) this.tomselect.clear(true);
    });

    // 2. Apply empty WebEOC OR filters for each dynamic filter field.
    //    Range selects use the search-range mechanism (cleared by clearsearch in step 7) — skip them.
    $('select[id$="-filter"]').each(function () {
      if ($(this).hasClass('tomselect-range')) return;
      var fieldName = $(this).data('field');
      if (
        fieldName &&
        typeof BoardScript !== 'undefined' &&
        typeof BoardScript.ApplyOrFilter === 'function'
      ) {
        BoardScript.ApplyOrFilter(fieldName, []);
      }
    });

    // 2b. Reset card group boolean checkboxes and clear their OR filters.
    $('[data-card-filter-field]').each(function () {
      var $group = $(this);
      var field  = $group.data('card-filter-field');
      $group.find('input[type="checkbox"]').prop('checked', false);
      if (field && typeof BoardScript !== 'undefined' && typeof BoardScript.ApplyOrFilter === 'function') {
        BoardScript.ApplyOrFilter(field, []);
      }
    });

    // 3. Rebuild child selects from empty parent state
    $('select[id$="-filter"]:not([data-parent])').each(function () {
      rebuildChildren($(this));
    });

    // 4. Clear WebEOC built-in search inputs
    if (typeof sys_SearchFilter !== 'undefined' && typeof sys_SearchFilter.clearAllInputs === 'function') {
      sys_SearchFilter.clearAllInputs();
    }
    $('[name*="searchfield_"]').val('');

    // 5. Clear flatpickr date range pickers and their WebEOC hidden inputs
    var startEl = $('.flat-range-start')[0];
    var endEl   = $('.flat-range-end')[0];
    if (startEl && startEl._flatpickr) startEl._flatpickr.clear();
    if (endEl   && endEl._flatpickr)   endEl._flatpickr.clear();
    $('[id^="searchfrom_"]').val('');
    $('[id^="searchto_"]').val('');

    // 6. Reset sort direction radios. Use the select's data-default-sort-dir if
    //    present; otherwise fall back to ascending.
    $('[data-sort-for]').each(function () {
      var sortSelectId = $(this).data('sort-for');
      var $sortSelect  = sortSelectId ? $('#' + sortSelectId) : $();
      var defaultDir   = $sortSelect.data('default-sort-dir') || 'asc';
      $(this).find('input[data-sort-dir="' + defaultDir + '"]').prop('checked', true);
    });

    // 7. Trigger WebEOC's clearsearch button to refresh the view
    $('span[button="clearsearch-button"] input[type="button"]').click();

    // 7.5. Restore default sort, but only for selects that had an active value before
    //      clearing. If no sort was selected, don't trigger any WebEOC sort operation.
    $('select[data-sort="true"]').each(function () {
      if (activeSortIds[this.id]) applyDefaultSort(this);
    });

    // 8. Reset search bar icons
    $('#search-status-icon').hide();
    $('#search-icon').show();
  };

  // ---------------------------------------------------------------------------
  // Auto-init on document ready
  // ---------------------------------------------------------------------------

  $(document).ready(function () {
    initDynamicWebEOCFilters();
    initCardGroupFilters();
    window.initDynamicSelects();
    window.initSortControls();
    window.initDynamicDateRangeFilter();
  });

})(jQuery);
