import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     SIDEBAR  (collapsible nav rail — collapse toggle, search-filter, active
     highlight). Generalized from a board-local jQuery sidebar.js. Vanilla JS,
     delegated on `document`, bound only off data-wui-sidebar-* attributes
     (classes stay for CSS only).

     Markup contract:
       [data-wui-sidebar-root]           the scrollable nav — scoping boundary
                                          for search/filter/highlight.
       [data-wui-sidebar-item]           a nav link/viewlink.
       [data-wui-sidebar-section-title]  a group heading above a run of items.
       [data-wui-sidebar-empty]          static "no matches" element (board
                                          owns its own i18n marker on it; this
                                          module only toggles its display).
       [data-wui-sidebar-search]         the filter <input>.
       [data-wui-sidebar-search-clear]   the clear button next to it.
       [data-wui-sidebar-toggle]         collapse/expand button. Value is
                                          either a CSS selector (starts with
                                          #, . or [ ) naming the scope element
                                          directly, or anything else (e.g.
                                          "true") -> nearest ancestor
                                          [data-wui-sidebar-scope]. Same
                                          selector-or-nearest-ancestor
                                          convention as data-wui-collapse
                                          (see disclosure.js).
         data-wui-sidebar-breakpoint     px width below which the sidebar is
                                          force-collapsed once it's crossed
                                          while expanded (int, default 992;
                                          one-directional — never forces back
                                          open).
         data-wui-sidebar-label-expanded / -collapsed
                                          i18n keys for the button's
                                          .wui-sidebar-btn-label child (the
                                          one child-class lookup this module
                                          allows, same convenience disclosure/
                                          theme modules use).
         data-wui-sidebar-aria-expanded / -collapsed
                                          i18n keys for the button's own
                                          aria-label.
         data-wui-sidebar-ratio-expanded / -collapsed
                                          optional class names toggled on
                                          the scope element as it
                                          collapses/expands (e.g. a
                                          wui-split ratio-1-3/ratio-1-4
                                          pair) — lets a board size its
                                          whole split off this same state
                                          with no CSS of its own.
       [data-wui-sidebar-scope]          the ancestor whose `sidebar-collapsed`
                                          class is toggled; fires
                                          `wui:sidebarcollapse`
                                          (detail: {collapsed}) on ITSELF so
                                          board-local code can react (resize a
                                          map, redraw a chart) with no
                                          knowledge of this module.
     ═══════════════════════════════════════════════════════════════════════ */

  function wuiSidebarT(key, fallback) {
    return (window.WUI && WUI.i18n) ? WUI.i18n.t(key, fallback) : fallback;
  }

  /* Walk up from el's parent looking for an ancestor whose subtree contains a
     `selector` match — finds the nearest ENCLOSING scope for a control even
     when the target isn't a plain ancestor of el (e.g. the search input lives
     in the sidebar header, a sibling of the nav root, not a descendant of
     it). Falls back to the whole document (single-sidebar-per-page case). */
  function wuiSidebarNearest(el, selector) {
    var node = el.parentElement;
    var found;
    while (node) {
      found = node.querySelector(selector);
      if (found) return found;
      node = node.parentElement;
    }
    return document.querySelector(selector);
  }

  /* Scoped nav root for any item/input: nearest ancestor first (the normal
     case), else the nearest-enclosing fallback above, else `document`. */
  function wuiSidebarRootFor(el) {
    var root = el.closest && el.closest('[data-wui-sidebar-root]');
    return root || wuiSidebarNearest(el, '[data-wui-sidebar-root]') || document;
  }

  /* Scope element for a toggle trigger: selector string wins, else nearest
     [data-wui-sidebar-scope] ancestor — mirrors data-wui-collapse exactly. */
  function wuiSidebarScopeFor(trigger) {
    var sel = trigger.getAttribute('data-wui-sidebar-toggle');
    var isSelector = sel && /^[#.[[]/.test(sel);
    return isSelector ? document.querySelector(sel) : trigger.closest('[data-wui-sidebar-scope]');
  }

  /* Sync one toggle button's label/aria to the scope's current collapsed
     state. Missing data attributes fall back to a generic English literal
     (used as both the i18n key and the fallback) as a last resort. */
  function wuiSidebarUpdateToggle(trigger, scopeEl) {
    if (!trigger || !scopeEl) return;
    var collapsed = scopeEl.classList.contains('sidebar-collapsed');
    var label = trigger.querySelector('.wui-sidebar-btn-label');
    if (label) {
      var labelKey = collapsed
        ? (trigger.getAttribute('data-wui-sidebar-label-collapsed') || 'Expand')
        : (trigger.getAttribute('data-wui-sidebar-label-expanded') || 'Collapse');
      label.textContent = wuiSidebarT(labelKey, collapsed ? 'Expand' : 'Collapse');
    }
    var ariaKey = collapsed
      ? (trigger.getAttribute('data-wui-sidebar-aria-collapsed') || 'ExpandSidebar')
      : (trigger.getAttribute('data-wui-sidebar-aria-expanded') || 'CollapseSidebar');
    trigger.setAttribute('aria-label', wuiSidebarT(ariaKey, collapsed ? 'Expand sidebar' : 'Collapse sidebar'));

    /* Optional: swap a ratio class (e.g. a wui-split ratio-1-3/ratio-1-4
       pair) on the scope element as the sidebar collapses/expands, so a
       board can size its whole split off the same collapse state instead
       of writing its own CSS. No-op if the trigger doesn't carry these. */
    var ratioExpanded = trigger.getAttribute('data-wui-sidebar-ratio-expanded');
    var ratioCollapsed = trigger.getAttribute('data-wui-sidebar-ratio-collapsed');
    if (ratioExpanded) scopeEl.classList.toggle(ratioExpanded, !collapsed);
    if (ratioCollapsed) scopeEl.classList.toggle(ratioCollapsed, collapsed);
  }

  function wuiSidebarUpdateAllToggles() {
    var triggers = document.querySelectorAll('[data-wui-sidebar-toggle]');
    for (var i = 0; i < triggers.length; i++) {
      var scopeEl = wuiSidebarScopeFor(triggers[i]);
      if (scopeEl) wuiSidebarUpdateToggle(triggers[i], scopeEl);
    }
  }

  /* click: collapse/expand -------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-wui-sidebar-toggle]');
    if (!trigger) return;
    var scopeEl = wuiSidebarScopeFor(trigger);
    if (!scopeEl) return;
    var collapsed = scopeEl.classList.toggle('sidebar-collapsed');
    wuiSidebarUpdateToggle(trigger, scopeEl);
    scopeEl.dispatchEvent(new CustomEvent('wui:sidebarcollapse', { bubbles: true, detail: { collapsed: collapsed } }));
  });

  /* Initial label/aria pass + one matchMedia breakpoint watcher per toggle
     button found at ready-time. One-directional: only forces collapse when
     crossing INTO narrow while currently expanded; never forces back open. */
  WUI.ready(function () {
    var triggers = document.querySelectorAll('[data-wui-sidebar-toggle]');
    for (var i = 0; i < triggers.length; i++) {
      (function (trigger) {
        var scopeEl = wuiSidebarScopeFor(trigger);
        if (!scopeEl) return;
        wuiSidebarUpdateToggle(trigger, scopeEl);

        var bp = parseInt(trigger.getAttribute('data-wui-sidebar-breakpoint'), 10);
        if (!bp || bp <= 0) bp = 992;
        var mq = window.matchMedia('(max-width: ' + bp + 'px)');
        function handleBreakpoint(e) {
          if (e.matches && !scopeEl.classList.contains('sidebar-collapsed')) {
            scopeEl.classList.add('sidebar-collapsed');
            wuiSidebarUpdateToggle(trigger, scopeEl);
            scopeEl.dispatchEvent(new CustomEvent('wui:sidebarcollapse', { bubbles: true, detail: { collapsed: true } }));
          }
        }
        mq.addEventListener('change', handleBreakpoint);
        handleBreakpoint(mq);
      })(triggers[i]);
    }
  });

  /* Re-localize every toggle's label/aria on language change — same
     document.documentElement listener idiom used across the codebase (see
     JS/tom-select-factory.js's wui:langchange handlers). */
  document.documentElement.addEventListener('wui:langchange', wuiSidebarUpdateAllToggles);

  /* search filter ------------------------------------------------------------
     Filters [data-wui-sidebar-item] within the scoped root by substring match
     on textContent, then re-derives section-title visibility (a title is
     visible only if at least one item between it and the next title — or the
     end of root — is currently visible; plain-DOM equivalent of jQuery's
     nextUntil), then toggles the static empty-state. */
  function wuiSidebarFilter(root, keyword) {
    var items = root.querySelectorAll('[data-wui-sidebar-item]');
    var i, item, text, visible, anyVisible = false;
    for (i = 0; i < items.length; i++) {
      item = items[i];
      text = (item.textContent || '').toLowerCase();
      visible = !keyword || text.indexOf(keyword) !== -1;
      item.style.display = visible ? '' : 'none';
      if (visible) anyVisible = true;
    }

    var titles = root.querySelectorAll('[data-wui-sidebar-section-title]');
    for (i = 0; i < titles.length; i++) {
      var title = titles[i];
      var hasVisible = false;
      var sib = title.nextElementSibling;
      while (sib && !sib.hasAttribute('data-wui-sidebar-section-title')) {
        if (sib.hasAttribute('data-wui-sidebar-item') && sib.style.display !== 'none') { hasVisible = true; break; }
        sib = sib.nextElementSibling;
      }
      title.style.display = hasVisible ? '' : 'none';
    }

    var empty = root.querySelector('[data-wui-sidebar-empty]');
    if (empty) empty.style.display = anyVisible ? 'none' : '';
  }

  document.addEventListener('input', function (e) {
    var input = e.target.closest && e.target.closest('[data-wui-sidebar-search]');
    if (!input) return;
    var keyword = (input.value || '').replace(/^\s+|\s+$/g, '').toLowerCase();
    var clearBtn = wuiSidebarNearest(input, '[data-wui-sidebar-search-clear]');
    if (clearBtn) clearBtn.style.display = keyword.length > 0 ? '' : 'none';
    wuiSidebarFilter(wuiSidebarRootFor(input), keyword);
  });

  document.addEventListener('click', function (e) {
    var clearBtn = e.target.closest('[data-wui-sidebar-search-clear]');
    if (!clearBtn) return;
    var input = wuiSidebarNearest(clearBtn, '[data-wui-sidebar-search]');
    if (!input) return;
    input.value = '';
    wuiSidebarFilter(wuiSidebarRootFor(input), '');
    clearBtn.style.display = 'none';
    input.focus();
  });

  /* active-item highlight, scoped to the same root ------------------------- */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-wui-sidebar-item]');
    if (!item) return;
    var root = wuiSidebarRootFor(item);
    var items = root.querySelectorAll('[data-wui-sidebar-item]');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
    item.classList.add('active');
  });
