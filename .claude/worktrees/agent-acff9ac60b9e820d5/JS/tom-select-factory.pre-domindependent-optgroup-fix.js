/**
 * tom-select-factory.js
 *
 * Usage:
 *   TomSelectFactory.init();                                      // whole document, DOM watch on (class: tomselect)
 *   TomSelectFactory.init(null, { className: 'wui-select' });   // target .wui-select only (adds to watched set)
 *   TomSelectFactory.init('#my-modal');                          // scoped first pass, DOM watch still covers page
 *   TomSelectFactory.init(null, { watch: false });               // one-shot, no MutationObserver
 *   TomSelectFactory.stopDomWatch();
 *   TomSelectFactory.get('FieldName');              // by id, else name
 *   TomSelectFactory.refresh('FieldName');          // clearOptions + sync (dependent selects)
 *   TomSelectFactory.destroy('FieldName');
 *   TomSelectFactory.enable('FieldName');
 *   TomSelectFactory.disable('FieldName');
 *
 * Markup (class `tomselect` on a `<select>`):
 *   data-placeholder, data-dropdown-parent (default: body),
 *   multiple / data-multi="true" for chips + remove button,
 *   data-create="true" for creatable,
 *   data-allow-empty="true" → keeps the empty option selectable in the dropdown
 *     (lets user actively clear a single-select). Omit for required fields —
 *     placeholder still shows on load but the user cannot re-select blank.
 *   data-src="api" + data-url + data-value-field + data-label-field
 *     + data-url-param + data-preload for remote search,
 *   data-on-change="GlobalFn" → window.GlobalFn(value, key, instance),
 *   data-render="templateName" → TomSelectFactory.registerTemplate() or window path.
 *   data-stay-open="true"
 *     → keeps the dropdown open after an option is selected (closeAfterSelect:false).
 *       Clicking the chevron or outside the dropdown still closes it normally.
 *       Useful when the dropdown also contains a pinned header/footer with controls
 *       (e.g. a direction picker) so the user can pick both field and direction
 *       without reopening. Omit for normal single-selection close behaviour.
 *   data-dropdown-header="#id" / data-dropdown-footer="#id"
 *     → moves a staged <div class="ts-dropdown-slot">…</div> into the dropdown
 *       as a pinned header / footer (see mountDropdownSlots). Also exposed as
 *       TomSelectFactory.mountDropdownSlots(ts, el) for non-factory instances.
 *   <optgroup label="…"> wraps <option>s in the native <select> markup — Tom
 *     Select auto-detects optgroups from a real <select> DOM node with zero
 *     extra config; this factory just supplies a styled, escaped
 *     render.optgroup_header (sticky uppercase section label, see
 *     tom-select-agency.css) so every factory-built select gets it for free.
 *   data-optgroup-columns="true"
 *     → lays out optgroups as side-by-side columns instead of stacked
 *       sections (Tom Select's own optgroup_columns plugin, already styled
 *       in tom-select-agency.css). Widen the control/dropdown yourself when
 *       using this — columns need real room, the default control width
 *       won't fit 2+ columns comfortably.
 *
 * Dependent (parent/child) selects:
 *   data-parent="ParentFieldName" or parent="ParentFieldName" on the child.
 *   When WebEOC replaces child options on parent change, the instance resyncs automatically.
 *
 * Multi-select edit-mode repopulation:
 *   WebEOC does not restore multi-select values natively. Handle at the page level:
 *     repopulateMultiSelect('FieldName', `<value-of select="//@FieldName"/>`);
 *   where repopulateMultiSelect splits the comma-separated string, sets jQuery val, then calls
 *     TomSelectFactory.get('FieldName')?.sync();
 */

const TomSelectFactory = (function () {

  /** @type {Record<string, TomSelect>} */
  const instances = {};

  /* ── Localized placeholders ────────────────────────────────────────────────
     Views tag a select's placeholder the normal i18n way:
       data-placeholder="Sort by..." data-wui-i18n-attr="data-placeholder:Key"
     WUI.i18n keeps the data-placeholder attribute fresh (on load + every toggle),
     and the factory reads data-placeholder at init — so the INITIAL render is
     already localized. TomSelect renders its own placeholder element, so here we
     push the current data-placeholder into every live control whenever the
     language changes. Covers every TomSelect (factory-, dynamic-filter-, or
     hand-created) — a view needs no wui:langchange handler of its own.

     Every select in this codebase uses the dropdown_input plugin, which MOVES
     control_input into the dropdown (as the search box) and creates a SEPARATE
     `.items-placeholder` <input> in the closed control to show placeholder text
     (set once at plugin setup — see tom-select.complete.min.js's dropdown_input
     definition). control_input.placeholder is therefore the WRONG target once
     that plugin is active: it silently updates the hidden dropdown search box
     instead of the visible closed-state placeholder (TomSelect core itself only
     touches control_input's placeholder when control_input still lives inside
     .control — never true here). Target .items-placeholder first; fall back to
     control_input only for the (currently nonexistent) non-dropdown_input case. */
  function relocalizeTomSelectPlaceholders() {
    document.querySelectorAll('[data-wui-i18n-attr]').forEach((el) => {
      const ts = el.tomselect;
      if (!ts) return;
      if ((el.getAttribute('data-wui-i18n-attr') || '').indexOf('data-placeholder') === -1) return;
      const ph = el.getAttribute('data-placeholder') || ts.settings.placeholder;
      ts.settings.placeholder = ph;
      // Both live at once, in different states — .items-placeholder shows in
      // the CLOSED control, control_input is what dropdown_input moves INTO
      // the open dropdown as the visible search box. They aren't
      // interchangeable: update both unconditionally, not else-if (else-if
      // meant control_input never got touched, since .items-placeholder
      // always exists — the open-dropdown search box stayed on whatever
      // language was active at construction, forever).
      const itemsPlaceholder = ts.control ? ts.control.querySelector('.items-placeholder') : null;
      if (itemsPlaceholder) itemsPlaceholder.placeholder = ph;
      if (ts.control_input) ts.control_input.placeholder = ph;
    });
  }
  try { document.documentElement.addEventListener('wui:langchange', relocalizeTomSelectPlaceholders); } catch (e) {}

  /* ── Localized TomSelect chrome (no_results / create / clear-button) ──────
     TomSelect's vendor render defaults ("No results found", "Add <strong>…",
     the clear_button plugin's baked-once "Clear All" title) are never
     localized anywhere in this codebase. render.no_results/option_create run
     live at dropdown-open time, so calling WUI.i18n.t() inside them is
     self-refreshing — no listener needed. clear_button's title IS baked once
     into an HTML string at plugin setup, so it needs an explicit DOM patch
     on wui:langchange. */
  function i18nText(key, fallback) {
    return (window.WUI && WUI.i18n) ? WUI.i18n.t(key, fallback) : fallback;
  }

  function i18nRenderOverrides() {
    return {
      no_results: () => '<div class="no-results">' + i18nText('NoResults', 'No results found') + '</div>',
      option_create: (data, escape) => '<div class="create">' + i18nText('AddNew', 'Add') + ' <strong>' + escape(data.input) + '</strong>&hellip;</div>',
      optgroup_header: (data, escape) => '<div class="optgroup-header">' + escape(data.label) + '</div>',
    };
  }

  function relocalizeClearButtons() {
    document.querySelectorAll('.tomselect').forEach((el) => {
      const ts = el.tomselect;
      if (!ts || !ts.wrapper) return;
      const btn = ts.wrapper.querySelector('.clear-button');
      if (btn) btn.title = i18nText('ClearSelections', 'Clear All');
    });
  }
  try { document.documentElement.addEventListener('wui:langchange', relocalizeClearButtons); } catch (e) {}

  /* ── Localized option labels ────────────────────────────────────────────────
     TomSelect snapshots <option> text at construction time (or last sync()) —
     a later WUI.i18n.apply() DOM update to a native <option>'s textContent
     never reaches TomSelect's own rendered dropdown. This resyncs every live
     TomSelect from its native <option> elements after WUI.i18n.apply() has
     already re-translated them on the same wui:langchange event. Only safe
     for selects whose native <option>s are still in the DOM post-init — NOT
     for .tomselect-range (see webeoc-dynamic-list-filters.js, which empties
     its native options and needs its own separate rebuild path). */
  function relocalizeTomSelectOptions() {
    document.querySelectorAll('select.tomselect:not(.tomselect-range)').forEach((el) => {
      const ts = el.tomselect;
      if (!ts) return;
      const selected = ts.getValue();
      // clearOptions()'s DEFAULT filter keeps whatever option is currently
      // selected (this.clearFilter: this.items.indexOf(value) >= 0) instead
      // of actually clearing it — meant to stop a selected chip flashing
      // away mid-refresh. That preserved entry then skips the loop below
      // entirely: addOption() no-ops on a value that already exists in
      // ts.options, so the selected option never gets its optgroup
      // re-matched — it just carries forward whatever (possibly already
      // orphaned, from an EARLIER pre-fix switch) state it happened to
      // have. Force a real full clear with an always-false filter; setValue
      // below re-selects it from the freshly (correctly grouped) re-added
      // option instead.
      ts.clearOptions(() => false);
      Array.from(el.options).forEach((opt) => {
        // Mirror TomSelect's own native-option parser: when allowEmptyOption is
        // false (every select in this codebase), an empty-value <option> is
        // deliberately excluded from the real options list — it only ever seeds
        // the placeholder text, it is never a selectable item. addOption() has
        // no such guard, so re-adding it here would let it become a real
        // (empty-text) selected item below — a DIFFERENT state from "nothing
        // selected" that hides the placeholder and shows a blank/wrong item
        // instead. Skip it, exactly like a fresh construction would.
        if (opt.value === '' && !ts.settings.allowEmptyOption) return;
        const data = { value: opt.value, text: opt.text };
        // Preserve optgroup membership across the rebuild. clearOptions()
        // only wipes this.options — this.optgroups (the group headers, each
        // auto-assigned a value at construction from the native <optgroup>'s
        // position) stays registered. addOption() with no optgroup field
        // silently orphans every re-added option from its group — the
        // headers still exist but nothing matches them anymore. Match this
        // option's native parent <optgroup> back to its registered group by
        // label (stable regardless of the auto-assigned value/order) so
        // grouped selects (e.g. data-optgroup-columns) don't lose their
        // structure on every language switch.
        const groupEl = opt.parentElement;
        if (groupEl && groupEl.tagName === 'OPTGROUP') {
          const labelField = ts.settings.optgroupLabelField;
          const group = Object.values(ts.optgroups || {}).find((g) => g[labelField] === groupEl.label);
          if (group) data[ts.settings.optgroupField] = group[ts.settings.optgroupValueField];
        }
        ts.addOption(data);
      });
      ts.refreshOptions(false);
      // selected === '' means nothing was chosen before the toggle — clear()
      // guarantees a true zero-items state (placeholder shows). setValue('')
      // would call addItem(''), which — now that '' isn't a registered option
      // above — silently no-ops, but clear() is the explicit, unambiguous path.
      if (selected === '') ts.clear(true);
      else ts.setValue(selected, true);
    });
  }
  try { document.documentElement.addEventListener('wui:langchange', relocalizeTomSelectOptions); } catch (e) {}

  /* ── RTL re-sync ────────────────────────────────────────────────────────
     TomSelect reads getComputedStyle(input).direction ONCE at construction
     and stores it as this.rtl — a plain boolean, never re-read afterwards.
     refreshState() (called internally on focus/blur/item changes) only
     re-applies that STALE captured value via wrapper.classList.toggle('rtl',
     this.rtl); it does not recheck direction. WUI.i18n.setLang() flips
     <html dir> live with no reload, so every already-constructed TomSelect
     instance's .rtl class (and anything else gated on it, e.g. advanceSelection's
     arrow-key reversal) silently goes stale the moment the user switches
     language — matches the exact symptom reported: correct on fresh load in
     EITHER language, broken immediately after switching, fixed only by a
     full refresh (which re-constructs the instance against the new direction).
     Force the instance's own rtl flag back in sync with the live <html dir>
     and let its own refreshState() reapply everything gated on it. */
  function resyncTomSelectDirection() {
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    document.querySelectorAll('.tomselect').forEach((el) => {
      const ts = el.tomselect;
      // ts.input guard: refreshState() → refreshValidityState() does
      // `e.input.validity && ...` with no null-check on e.input itself —
      // a vendor bug that throws instead of no-op'ing on any instance
      // whose .input is missing (stale/mid-teardown TomSelect, e.g. a
      // cascading child select TomSelectFactory just destroyed/rebuilt
      // for a parent change). Skip those rather than crash the whole
      // langchange handler chain for every other select on the page.
      if (!ts || !ts.input || ts.rtl === rtl) return;
      ts.rtl = rtl;
      try { ts.refreshState(); } catch (e) {}
    });
  }
  try { document.documentElement.addEventListener('wui:langchange', resyncTomSelectDirection); } catch (e) {}

  /** @type {Map<string, HTMLSelectElement>} */
  const elementByKey = new Map();
  /** @type {Record<string, object>} */
  const templates = {};
  /** Classes registered via init() — DOM watch targets all of them */
  const activeClasses = new Set();

  // ── Template registry ─────────────────────────────────────────────────────

  const RENDER_KEYS = [
    'option', 'item', 'option_create', 'no_results', 'not_loading',
    'optgroup', 'optgroup_header', 'loading', 'dropdown',
  ];

  function registerTemplate(name, def) {
    templates[name] = def;
  }

  function resolveRenderDefinition(name) {
    if (!name) return null;
    if (templates[name]) return templates[name];
    const def = name.split('.').reduce((cur, p) => cur?.[p], window);
    if (!def || typeof def !== 'object') {
      console.warn(`[TomSelectFactory] data-render "${name}" not found`);
      return null;
    }
    return def;
  }

  function applyRenderToConfig(config, tmpl) {
    config.render = config.render || {};
    RENDER_KEYS.forEach(key => {
      if (typeof tmpl[key] === 'function') config.render[key] = tmpl[key];
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function controlKey(el) {
    if (el.id?.trim()) return el.id.trim();
    if (el.name?.trim()) return el.name.trim();

    // Generate and stamp a stable key so re-scans don't re-init
    const generated = 'ts-' + Math.random().toString(36).slice(2, 9);
    el.setAttribute('data-ts-key', generated);
    return generated;
  }

  // ── Placeholder option injection ──────────────────────────────────────────
  //
  // WebEOC <filterlistdropdown> never generates an empty first <option>.
  // Without it, form submission sends the first real option value when the
  // user hasn't picked anything (and TomSelect has no "empty" anchor to use
  // as the cleared state). We inject one unconditionally for single selects.
  //
  // Why not guard on `option[selected]` for edit mode: the native <select>
  // respects the `selected` attribute over element position, so a real option
  // that has `selected` will remain the selected value even after our empty
  // option is inserted at position 0. Edit-mode is unaffected.
  //
  // data-allow-empty="true" → allowEmptyOption:true (the empty option stays
  // in the dropdown so the user can actively re-select "nothing").
  // Omit the attribute → allowEmptyOption:false (placeholder only; once a
  // real value is picked the user cannot re-select blank from the dropdown).

  function ensurePlaceholderOption(el) {
    if (el.multiple || el.dataset.multi === 'true') return; // multi handles its own empty state
    if (el.dataset.src === 'api') return;                   // API selects load options asynchronously
    if (el.querySelector('option[value=""]')) return;       // already has an empty option

    const opt = document.createElement('option');
    opt.value = '';
    el.insertBefore(opt, el.firstChild);
  }

  // ── Post-init clear for new-record selects ────────────────────────────────
  //
  // Even with an empty option at position 0, TomSelect reads the native
  // select's current value at init time. If no option has an explicit
  // `selected` attribute, the browser auto-selects position 0 (our empty
  // option) and TomSelect should start empty — but if TomSelect internally
  // falls through and picks the first real option anyway, we force-clear.
  //
  // The `selected` HTML attribute (vs the .selected DOM property) is the
  // reliable edit-mode signal: WebEOC stamps `selected` only on the correct
  // saved option. Browser auto-selection sets the property, not the attribute.
  // So: hasAttribute('selected') === false → browser default → safe to clear.

  function clearIfNoExplicitSelection(el, ts) {
    if (el.multiple || el.dataset.multi === 'true') return;
    if (el.dataset.src === 'api') return;
    const selectedOpt = el.options[el.selectedIndex];
    if (selectedOpt && !selectedOpt.hasAttribute('selected')) {
      ts.clear(true); // silent — no onChange fire; shows placeholder
    }
  }

  // ── Config builder ────────────────────────────────────────────────────────

  function buildConfig(el, key) {
    const isMulti = el.multiple || el.dataset.multi === 'true';
    const isApi = el.dataset.src === 'api';
    const isCreate = el.dataset.create === 'true';
    const allowEmpty = el.dataset.allowEmpty === 'true';
    const stayOpen = el.dataset.stayOpen === 'true';
    const optgroupColumns = el.dataset.optgroupColumns === 'true';
    const tmpl = resolveRenderDefinition(el.dataset.render);

    const plugins = ['dropdown_input'];
    if (isMulti) plugins.push('remove_button');
    if (optgroupColumns) plugins.push('optgroup_columns');

    const config = {
      // allowEmptyOption:true lets the user re-select the empty option from the
      // dropdown (opt-in via data-allow-empty="true"). false = placeholder only.
      allowEmptyOption: allowEmpty,
      placeholder: el.dataset.placeholder || 'Select...',
      dropdownParent: el.dataset.dropdownParent || 'body',
      plugins,
      maxItems: isMulti ? null : 1,
      render: i18nRenderOverrides(),
    };

    // data-stay-open="true": keep dropdown open after option selection so the
    // user can also interact with a pinned header/footer (e.g. direction picker).
    // Chevron click and outside-click still close normally — those paths bypass
    // closeAfterSelect entirely (TomSelect calls close() directly for them).
    if (stayOpen) config.closeAfterSelect = false;

    if (isCreate) {
      config.create = true;
      config.createOnBlur = true;
    }

    const fnName = el.dataset.onChange;
    if (fnName) {
      config.onChange = function (value) {
        const fn = window[fnName];
        if (typeof fn === 'function') fn(value, key, instances[key]);
        else console.warn(`[TomSelectFactory] onChange "${fnName}" not found on window`);
      };
    }

    if (tmpl) applyRenderToConfig(config, tmpl);

    if (isApi) {
      const url = el.dataset.url;
      const param = el.dataset.urlParam || 'q';
      const valueField = el.dataset.valueField || 'id';
      const labelField = el.dataset.labelField || 'text';

      Object.assign(config, {
        valueField,
        labelField,
        searchField: [labelField],
        preload: el.dataset.preload === 'true' ? true
          : el.dataset.preload === 'focus' ? 'focus'
            : false,
        load(query, callback) {
          fetch(`${url}?${param}=${encodeURIComponent(query)}`)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(data => callback(data))
            .catch(() => callback());
        },
      });
    }

    return config;
  }

  // ── Dependent select (parent/child cascade) ───────────────────────────────
  //
  // When the parent changes, WebEOC replaces the child's <option> list entirely.
  // Option count change → clearOptions + sync to mirror the new native list.
  // Mutations where count is unchanged are Tom Select touching its own DOM — ignore.

  function wireDependentSelect(el, ts) {
    const parentAttr = el.dataset.parent || el.getAttribute('parent');
    if (!parentAttr) return;

    const parentEl = document.querySelector(`[name="${parentAttr}"]`);
    if (!parentEl) return;

    const handler = () => {
      // Wait for WebEOC to finish updating the native select before rebuilding.
      // We cannot use ts.sync() here: WebEOC's parent cascade hides stale options
      // with style.display='none' rather than removing them from the DOM, so sync()
      // reads ALL native options — including the hidden ones from the previous
      // parent value — and they end up visible in the TomSelect dropdown.
      // Instead, rebuild manually from only the currently visible native options.
      setTimeout(() => {
        ts.clear(true);
        ts.clearOptions();
        Array.from(el.options).forEach(function (opt) {
          if (opt.style.display === 'none') return;
          ts.addOption({ value: opt.value, text: opt.text });
        });
        ts.refreshOptions(false);
      }, 50);
    };

    parentEl.addEventListener('change', handler);
    el.__tsParentEl = parentEl;
    el.__tsParentHandler = handler;
  }

  // ── Dropdown slots (plug-and-apply custom dropdown content) ────────────────
  //
  // Render arbitrary markup inside a select's dropdown as a pinned header and/or
  // footer. Point the select at a staged container:
  //
  //   <select class="tomselect"
  //           data-dropdown-header="#my-head" data-dropdown-footer="#my-foot"></select>
  //   <div id="my-head" class="ts-dropdown-slot"> …any HTML / controls… </div>
  //
  // The container (hidden by .ts-dropdown-slot until mounted) is MOVED — not
  // cloned, so ids / input names stay unique — into the dropdown: header before
  // the option list (stays pinned above the scroll), footer after it. Slot
  // clicks are kept from reaching Tom Select (no option-select / no close), and
  // non-text mousedowns retain control focus so the menu stays open.
  //
  // Note: the node is consumed into the dropdown, so a select that is destroyed
  // + re-initialized loses its slot. Mount once-initialized controls.

  function mountDropdownSlots(ts, el) {
    if (!ts || !ts.dropdown || !el) return;
    ['header', 'footer'].forEach(slot => {
      const sel = el.getAttribute('data-dropdown-' + slot);
      if (!sel) return;
      const node = document.querySelector(sel);
      if (!node || node.__tsMounted) return;

      node.classList.remove('ts-dropdown-slot');
      node.classList.add('ts-dropdown-' + slot);

      if (slot === 'header') ts.dropdown.insertBefore(node, ts.dropdown.firstChild);
      else ts.dropdown.appendChild(node);

      // Keep focus on the TomSelect control (losing focus closes the dropdown).
      // stopPropagation prevents TomSelect's document-level listeners; preventDefault
      // prevents focus transfer for non-text elements on mousedown.
      node.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (!e.target.closest('input:not([type="radio"]):not([type="checkbox"]):not([type="button"]),textarea,select,[contenteditable]')) {
          e.preventDefault();
        }
      });

      // Labels wrapping radio/checkbox: after the label's click, the browser fires
      // a synthetic click on the wrapped input (its "activation behaviour"). That
      // synthetic click focuses the input — stealing focus from TomSelect and
      // closing the dropdown — even though mousedown.preventDefault kept the label
      // itself unfocused. Fix: cancel the label's activation behaviour by calling
      // e.preventDefault() on the label's click, then manually toggle + dispatch
      // change so the control still updates without any focus movement.
      node.querySelectorAll('label').forEach(lbl => {
        const inp = lbl.querySelector('input[type="radio"], input[type="checkbox"]');
        if (!inp) return;
        lbl.addEventListener('click', e => {
          if (e.target === inp) return; // direct click on the input itself — mousedown guard handles focus
          e.preventDefault();          // cancel activation → no synthetic click → no focus theft
          e.stopPropagation();
          if (inp.type === 'radio') inp.checked = true;
          else inp.checked = !inp.checked;
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });

      // Direct radio/checkbox clicks: stop propagation (toggle is native; focus is
      // already blocked by mousedown.preventDefault on the slot).
      node.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(inp => {
        inp.addEventListener('click', e => e.stopPropagation());
      });

      node.addEventListener('click', e => e.stopPropagation());

      node.__tsMounted = true;
    });
  }

  // ── DOM watch (late-injected controls, e.g. eocorepeatallrecords) ─────────

  let domObserver = null;
  let domTimer = null;

  function tryInit(el, className) {
    if (!el || el.nodeType !== 1) return;
    if (el.tagName !== 'SELECT' || !el.classList.contains(className)) return;
    if (el.tomselect) return;
    if (el.hasAttribute('data-ts-ignore')) return;

    const existingKey = el.dataset.tsKey;
    if (existingKey && instances[existingKey]) return;

    const key = existingKey || controlKey(el);
    if (instances[key]) return;

    ensurePlaceholderOption(el);
    const ts = new TomSelect(el, buildConfig(el, key));
    instances[key] = ts;
    elementByKey.set(key, el);
    clearIfNoExplicitSelection(el, ts);
    wireDependentSelect(el, ts);
    mountDropdownSlots(ts, el);
  }

  function scanAndInit(root, className) {
    (root === document ? document : root)
      .querySelectorAll(`select.${className}`)
      .forEach(el => tryInit(el, className));
  }

  function stopDomWatch() {
    domObserver?.disconnect();
    domObserver = null;
    clearTimeout(domTimer);
    domTimer = null;
  }

  function startDomWatch() {
    if (domObserver) return;
    domObserver = new MutationObserver(() => {
      clearTimeout(domTimer);
      domTimer = setTimeout(() => activeClasses.forEach(c => scanAndInit(document, c)), 50);
    });
    domObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  // Shared constructor for callers that build their own config (e.g.
  // webeoc-dynamic-list-filters.js's cascading/AJAX-driven filter selects,
  // whose onChange/onClear + parent-child rebuild logic is fundamentally
  // different from this factory's own wireDependentSelect and therefore isn't
  // migrated onto it). This only centralizes the `new TomSelect()` call +
  // instance registry (so TomSelectFactory.get()/destroy() reach these too) —
  // it does NOT touch config, does NOT call ensurePlaceholderOption/
  // clearIfNoExplicitSelection/wireDependentSelect, so it introduces no
  // behavior change for existing callers.
  //
  // Idempotent by design: if el.tomselect already exists, returns it as-is
  // instead of constructing a second instance. This is what makes it safe for
  // a view to load both this factory (with its own lazy/scoped init() calls,
  // e.g. an advanced-filter-drawer's `wui:open`-gated init) AND
  // webeoc-dynamic-list-filters.js targeting the SAME selects — whichever
  // runs first wins, the other's construct() call is a no-op. (A caller that
  // needs a fresh instance, e.g. a cascade rebuild, destroys the old one
  // itself before calling construct() again — same pattern as before.)
  function construct(el, config) {
    if (el.tomselect) return el.tomselect;
    const key = controlKey(el);
    const ts = new TomSelect(el, config);
    instances[key] = ts;
    elementByKey.set(key, el);
    return ts;
  }

  function init(scope, options) {
    options = options || {};
    const className = options.className || 'tomselect';
    activeClasses.add(className);
    const root = scope ? document.querySelector(scope) : document;
    if (!root) {
      console.warn('[TomSelectFactory] init: scope not found:', scope);
      return;
    }
    scanAndInit(root, className);
    if (options.watch !== false) startDomWatch();
  }

  function get(key) { return instances[key] ?? null; }
  function enable(key) { instances[key]?.enable(); }
  function disable(key) { instances[key]?.disable(); }

  function refresh(key) {
    const ts = instances[key];
    if (!ts) return;
    ts.clearOptions();
    ts.sync();
  }

  function destroy(key) {
    const el = elementByKey.get(key);
    if (el) {
      el.__tsParentObserver?.disconnect();
      if (el.__tsParentEl && el.__tsParentHandler) {
        el.__tsParentEl.removeEventListener('change', el.__tsParentHandler);
      }
      elementByKey.delete(key);
    }
    instances[key]?.destroy();
    delete instances[key];
  }

  return { init, get, destroy, refresh, enable, disable, instances, registerTemplate, stopDomWatch, mountDropdownSlots, construct };

})();

// `const` above is a lexical global (reachable by bare name, not via window).
// Mirror it onto window so cross-script consumers can feature-detect it either way.
if (typeof window !== 'undefined') window.TomSelectFactory = TomSelectFactory;