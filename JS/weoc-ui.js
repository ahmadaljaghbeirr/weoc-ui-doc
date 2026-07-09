/* =============================================================================
   weoc-ui.js  —  weoc-ui library behaviours

   The JS companion to the weoc-ui CSS library. Small, framework-agnostic
   primitives + declarative behaviours that components and views build on.

   ── Migration intent ───────────────────────────────────────────────────────
   Every board view currently inlines its own copy of reusable glue —
   dismissible popovers/drawers, popover positioning, view-toggle groups,
   clickable-card selection + guards, debounced search. THIS FILE is where that
   lives going forward. A view keeps its inline version until it's migrated onto
   the matching helper here, then deletes it. So: anything in a view's <script>
   that isn't board-specific domain logic (map setup, field bindings, board
   data calls) is a candidate to delete in favour of weoc-ui.

   ── Principles ──────────────────────────────────────────────────────────────
   • Vanilla JS. Coexists with jQuery; depends on nothing.
   • NEVER references a board/component class (.ev-card, .wui-drawer, …). Works
     only off data-wui-* attributes or arguments passed in — same boundary the
     CSS keeps.
   • Accessibility (focus trap/restore, Esc, aria) is owned here once, so every
     overlay inherits it.
   • Declarative behaviours are delegated on `document`, so they cover content
     added later (WebEOC repeat regions, AJAX refreshes) with no re-binding.

   ── API index ───────────────────────────────────────────────────────────────
   Theme (auto-applied on load — no per-board loadTheme)
     WUI.getTheme()                    'light' | 'dark' (current)
     WUI.setTheme(theme[, {persist}])  set + persist (eoc key, + Nexus key if present) + event
     WUI.toggleTheme()                 flip light <-> dark
     WUI.nativeTheme                   true on Nexus (a native theme control exists)
     [data-wui-theme-toggle]           button → toggleTheme; auto-hidden on Nexus
     WUI.applyTinyMCETheme(editor)     set the current theme on ONE TinyMCE editor's iframe
     WUI.syncTinyMCETheme()            re-sync ALL live TinyMCE editors (auto-run on themechange)
   Utilities
     WUI.ready(fn)                     run after DOM is parsed
     WUI.debounce(fn, ms[, immediate]) trailing (or leading) debounce
     WUI.throttle(fn, ms)              rate-limit
     WUI.afterTransition(el, cb[, ms]) run cb once the element's transition ends
     WUI.lockScroll() / unlockScroll() reference-counted body scroll lock
   Section observer / refresh
     WUI.observeSection(target, cb)    MutationObserver for WebEOC updatesection refreshes;
                                       returns { disconnect }. Safe to call N times per view.
     WUI.refreshSection(target, opts)  jQuery AJAX section refresh with before/done/error
                                       hooks. opts: { url, data, before, done, error }.
                                       Fires wui:sectionrefresh on the section after swap.
   Class helpers
     WUI.setVariant(el, value, group)  set ONE mutually-exclusive class from a set
     WUI.selectOne(items, target, cls) roving "active" within a group (cls: str|str[])
     WUI.showView(group, name)         show one [data-wui-view] in a named group, hide the
                                       rest, move WebEOC updatesection onto the visible one
   Positioning
     WUI.anchor(floating, trigger, o)  place a fixed element; flip + clamp on-screen
   Overlay lifecycle
     WUI.open/close/toggle(panel[, trigger])
   Toast / Snackbar (transient notifications — §11)
     WUI.toast(msg[, opts])            corner toast; returns handle { el, dismiss }
     WUI.snackbar(msg[, opts])         bottom-center, single-at-a-time, inline action
     WUI.dismissToast(handle|el)       dismiss one
     WUI.dismissToasts()               dismiss all live toasts
       opts: variant · position · duration (0=sticky) · icon · title · dismissible · action
             action: 'Label' | { label, onClick(handle) }
   Declarative (attributes, auto-wired)
     [data-wui-toggle="#id"]           trigger: toggles the target panel (overlay)
     [data-wui-dismiss]                inside a panel: closes it
       panel opts: data-wui-open-class (default is-open) · data-wui-backdrop
                   data-wui-lock · data-wui-trap · data-wui-no-esc · data-wui-no-outside
     [data-wui-activate]               clickable card/row: guard + select + fire wui:activate
       opts: data-wui-group (group selector) · data-wui-active (class[es])
             data-wui-panel ("#id") — expands a split panel; on close, active class is cleared
     [data-wui-panel-close="#id"]      collapse the split panel + clear linked active items
       split opts: data-wui-panel-close-class (default is-collapsed) — class meaning "closed"
                   data-wui-panel-open-class  — extra class added on expand, removed on collapse
     [data-wui-collapse]               inline expand/collapse: toggles is-open on the
                                       nearest [data-wui-collapsible] (or "#id").
                                       Three CSS variants: wui-collapsible (boxed),
                                       wui-section-collapse (ghost), wui-collapse-panel
                                       (card + accent: primary|success|warning|danger|secondary)
     [data-wui-segment] + [data-wui-value]  segmented control / tab bar / button group:
                                       sets one active, fires wui:select (detail.value)
       opts: data-wui-views="#group"   also switch [data-wui-view] panels by name +
                                       move updatesection onto the shown one
     [data-wui-row]                    expandable log/table row: toggles is-open (guards
                                       inner controls). Keep the detail as a sibling.
     [data-wui-step="up|down"]         themed number stepper: steps the number input inside
                                       the same .wui-number wrapper (honours min/max/step),
                                       then fires input + change. See weoc-forms.css .wui-number.
     (sticky cards header)             EVERY .wui-table-cards auto-binds: <thead> gets
                                       .wui-sticky-managed (transparent at rest) + .is-stuck
                                       when pinned (CSS swaps it opaque). No attribute needed.
                                       data-wui-sticky-head="true" opts any OTHER table in too.
                                       Needs a scrolling ancestor. WUI.initStickyHeaders().
   Events emitted
     wui:open / wui:close (on overlays) · wui:activate (on items) · wui:select (on segment
     items) · wui:viewchange (on a view container) · wui:rowtoggle (on an expandable row)
     · wui:panelopen / wui:panelclose (on split panels) · wui:themechange (on <html>, detail.dark)
     · wui:sectionrefresh (on section el, after WUI.refreshSection DOM swap, detail.el)
     · wui:toast:show / wui:toast:dismiss / wui:toast:action (on the toast el, detail.toast)

   Requires (CSS): .wui-scroll-locked { overflow: hidden; }

   XML / XSL views (WebEOC): boolean attributes need a value — write
   data-wui-backdrop="true", data-wui-dismiss="true", data-wui-activate="true",
   data-wui-no-activate="true" (valueless attributes aren't well-formed XML).
   data-wui-panel-close="#id" takes a selector value, not a boolean — always has a value.
   The helpers use presence checks, so any value works.
   EXCEPTION: data-wui-collapse reads its value as a CSS selector when it starts with
   #, ., or [ (e.g. data-wui-collapse="#my-id"). Write data-wui-collapse="true" in XSL
   for the default nearest-collapsible behaviour — "true" is treated as boolean, not
   a selector.
   ============================================================================= */
(function (window, document) {
  'use strict';

  var WUI = window.WUI || (window.WUI = {});
  WUI.version = '0.1.0';

  /* ═══════════════════════════════════════════════════════════════════════
     0) THEME  (dark / light)
     Applied SYNCHRONOUSLY the moment this file is parsed — so just including
     weoc-ui.js in <head> sets <html data-theme> before the body paints (no
     flash, no per-board loadTheme()).

     Resolve order:
       1. 'juvareUserPreferredThemeMode'  — Nexus sets this natively; we read it.
       2. 'eocUserPreferredThemeMode'      — OURS. Legacy WebEOC has no native key,
          so we create + manage this one (the single key everything reads/writes there).
       3. OS preference (prefers-color-scheme), then 'light'.
     On LEGACY first run (neither key present) we CREATE our key so the choice sticks.

     WUI.getTheme() · WUI.setTheme('dark'|'light'[, {persist:false}]) · WUI.toggleTheme()
     setTheme always writes our key, and ALSO syncs the Nexus key when it's present
     (so a toggle persists in either world). Fires `wui:themechange` on <html> (detail.dark).

     [data-wui-theme-toggle]  — declarative switch on any button (click = toggleTheme).
       AUTO-HIDDEN on Nexus (native control exists), shown on legacy. WUI.nativeTheme
       flags whether a native theme control is present (true on Nexus).
     ═══════════════════════════════════════════════════════════════════════ */

  WUI.THEME_KEY          = 'juvareUserPreferredThemeMode';   /* Nexus — platform-set   */
  WUI.THEME_KEY_FALLBACK = 'eocUserPreferredThemeMode';      /* ours — legacy singleton */

  function wuiLSget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function wuiLSset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function wuiResolveTheme() {
    var j = wuiLSget(WUI.THEME_KEY);          if (j === 'dark' || j === 'light') return j;   /* Nexus  */
    var e = wuiLSget(WUI.THEME_KEY_FALLBACK); if (e === 'dark' || e === 'light') return e;   /* legacy */
    try { if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'; } catch (e2) {}
    return 'light';
  }

  WUI.getTheme = function () {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  WUI.setTheme = function (theme, opts) {
    theme = (theme === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (!opts || opts.persist !== false) {
      wuiLSset(WUI.THEME_KEY_FALLBACK, theme);                               /* ours — always        */
      if (wuiLSget(WUI.THEME_KEY) != null) wuiLSset(WUI.THEME_KEY, theme);   /* sync Nexus key if set */
    }
    document.documentElement.dispatchEvent(new CustomEvent('wui:themechange', {
      bubbles: true, detail: { theme: theme, dark: theme === 'dark' }
    }));
    return theme;
  };

  WUI.toggleTheme = function () {
    return WUI.setTheme(WUI.getTheme() === 'dark' ? 'light' : 'dark');
  };

  /* Apply now (synchronous, during <head> parse). Capture whether a NATIVE theme
     control exists (Nexus = the Juvare key is present). On legacy first run — neither
     key present — create our key so the resolved theme persists from here on. */
  (function () {
    WUI.nativeTheme = (wuiLSget(WUI.THEME_KEY) != null);   /* true on Nexus */
    var theme = wuiResolveTheme();
    document.documentElement.setAttribute('data-theme', theme);
    if (!WUI.nativeTheme && wuiLSget(WUI.THEME_KEY_FALLBACK) == null) {
      wuiLSset(WUI.THEME_KEY_FALLBACK, theme);
    }
  })();

  /* [data-wui-theme-toggle] — declarative theme switch: drop it on any button and a
     click flips light<->dark. AUTO-HIDDEN on Nexus (which already has a native theme
     control), SHOWN on legacy (which doesn't). Listen to `wui:themechange` to swap the
     button's own icon/label. */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-wui-theme-toggle]')) WUI.toggleTheme();
  });

  if (WUI.nativeTheme) {
    var wuiHideThemeToggles = function () {
      var els = document.querySelectorAll('[data-wui-theme-toggle]');
      for (var i = 0; i < els.length; i++) els[i].style.display = 'none';
    };
    if (document.readyState !== 'loading') wuiHideThemeToggles();
    else document.addEventListener('DOMContentLoaded', wuiHideThemeToggles);
  }

  /* ── TinyMCE theme sync ────────────────────────────────────────────────────
     A TinyMCE editor renders its content in an <iframe> — a SEPARATE document
     that inherits nothing from the page, so setting <html data-theme> here does
     NOT reach it. tinymce-content-tokens.css (loaded via `content_css`) reads a
     data-theme on the IFRAME's own <html>; these helpers put it there and keep
     it in lock-step with the page. The .tox-* chrome lives in THIS document and
     already follows the page theme via agency tokens — only the content iframe
     needs the bridge.

     Per editor, one line in your init (init_instance_callback fires once the
     iframe exists AND content_css has applied — the reliable hook):
       init_instance_callback: function (ed) { WUI.applyTinyMCETheme(ed); }
     Live toggles are handled for you: wui:themechange re-syncs every editor. */
  function wuiSetEditorTheme(ed, theme) {
    try {
      var doc = ed && ed.getDoc && ed.getDoc();
      if (doc && doc.documentElement) doc.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  }

  /* Apply the current page theme to one editor's content iframe. */
  WUI.applyTinyMCETheme = function (ed) {
    wuiSetEditorTheme(ed, WUI.getTheme());
  };

  /* Re-sync every editor to the current page theme. Uses tinymce.get() (the
     stable API that returns the array of all editors) — NOT tinymce.editors,
     which isn't a public property in TinyMCE 8, so the old code bailed here and
     toggles never reached the iframe. wuiSetEditorTheme's getDoc() guard safely
     skips any editor that isn't ready yet. */
  WUI.syncTinyMCETheme = function () {
    var tm = window.tinymce;
    if (!tm) return;
    var eds = (typeof tm.get === 'function') ? tm.get() : tm.editors;
    if (!eds || !eds.length) return;
    var theme = WUI.getTheme();
    for (var i = 0; i < eds.length; i++) wuiSetEditorTheme(eds[i], theme);
  };

  /* Live toggle → re-theme all editors. If TinyMCE isn't present this is a no-op. */
  document.documentElement.addEventListener('wui:themechange', function () {
    WUI.syncTinyMCETheme();
  });

  /* If TinyMCE is already on the page, auto-apply the theme to every editor as it
     initializes — so boards don't even need the setup one-liner. (When TinyMCE
     loads later, use the setup hook above; wui:themechange still covers toggles.) */
  if (window.tinymce && typeof window.tinymce.on === 'function') {
    window.tinymce.on('AddEditor', function (e) {
      if (e && e.editor) e.editor.on('init', function () { WUI.applyTinyMCETheme(e.editor); });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     1) UTILITIES
     ═══════════════════════════════════════════════════════════════════════ */

  WUI.ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  /* Trailing debounce (leading if `immediate`). For search inputs, resize, etc. */
  WUI.debounce = function (fn, wait, immediate) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      var callNow = immediate && !t;
      clearTimeout(t);
      t = setTimeout(function () {
        t = null;
        if (!immediate) fn.apply(ctx, args);
      }, wait);
      if (callNow) fn.apply(ctx, args);
    };
  };

  /* Rate-limit (leading + trailing). For scroll/pointermove handlers. */
  WUI.throttle = function (fn, wait) {
    var last = 0, t;
    return function () {
      var ctx = this, args = arguments, now = Date.now();
      var remaining = wait - (now - last);
      if (remaining <= 0) {
        if (t) { clearTimeout(t); t = null; }
        last = now;
        fn.apply(ctx, args);
      } else if (!t) {
        t = setTimeout(function () { last = Date.now(); t = null; fn.apply(ctx, args); }, remaining);
      }
    };
  };

  /* Run cb once the element's own transition ends — with a fallback timer so it
     still fires under reduced-motion / display:none / no transition. Replaces
     hard-coded setTimeout(…, <css-duration>) couplings (e.g. the map resize). */
  WUI.afterTransition = function (el, cb, fallbackMs) {
    if (!el) { if (cb) cb(); return; }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      if (cb) cb();
    }
    function onEnd(e) { if (e.target === el) finish(); }
    el.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, fallbackMs == null ? 500 : fallbackMs);
  };

  /* Body scroll lock — counter so a modal stacked over a drawer doesn't unlock
     the page when the first one closes. */
  var lockCount = 0;
  WUI.lockScroll = function () {
    if (lockCount === 0) document.body.classList.add('wui-scroll-locked');
    lockCount++;
  };
  WUI.unlockScroll = function () {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) document.body.classList.remove('wui-scroll-locked');
  };

  /* ═══════════════════════════════════════════════════════════════════════
     2) CLASS HELPERS
     ═══════════════════════════════════════════════════════════════════════ */

  /* Set one class from a mutually-exclusive group (e.g. ratio-3-2 vs ratio-2-1
     on the split). Pass value = '' / null to clear them all. */
  WUI.setVariant = function (el, value, group) {
    if (!el) return;
    (group || []).forEach(function (c) { el.classList.remove(c); });
    if (value) el.classList.add(value);
  };

  /* Roving "active": mark target within a group and clear the siblings.
     items: selector string | NodeList | Array.  cls: string | string[]. */
  WUI.selectOne = function (items, target, cls) {
    var classes = Array.isArray(cls) ? cls : [cls || 'is-active'];
    var list = typeof items === 'string' ? document.querySelectorAll(items) : items;
    Array.prototype.forEach.call(list, function (el) {
      var on = el === target;
      classes.forEach(function (c) { el.classList.toggle(c, on); });
    });
  };

  /* ═══════════════════════════════════════════════════════════════════════
     3) POSITIONING
     ═══════════════════════════════════════════════════════════════════════ */

  /* Position a FIXED floating element next to a trigger, flipping vertically and
     clamping horizontally to stay on-screen. Covers the popover / map-pin
     placement views hand-roll.
     opts: { side:'bottom'|'top', align:'start'|'center'|'end', gap, margin }. */
  WUI.anchor = function (floating, trigger, opts) {
    opts = opts || {};
    var gap = opts.gap == null ? 6 : opts.gap;
    var margin = opts.margin == null ? 8 : opts.margin;
    var vw = window.innerWidth, vh = window.innerHeight;
    var t = trigger.getBoundingClientRect();
    var fw = floating.offsetWidth, fh = floating.offsetHeight;
    var top;

    if (opts.side === 'top') {
      top = t.top - fh - gap;
      if (top < margin) top = t.bottom + gap;                 // flip down if no room
    } else {
      top = t.bottom + gap;
      if (top + fh > vh - margin) top = t.top - fh - gap;     // flip up if no room
      if (top < margin) top = margin;
    }

    var align = opts.align || 'end';
    var left = align === 'start'  ? t.left
             : align === 'center' ? t.left + (t.width - fw) / 2
             :                      t.right - fw;
    left = Math.max(margin, Math.min(left, vw - fw - margin)); // clamp on-screen

    floating.style.position = 'fixed';
    floating.style.top = Math.round(top) + 'px';
    floating.style.left = Math.round(left) + 'px';
    floating.style.right = 'auto';
  };

  /* ═══════════════════════════════════════════════════════════════════════
     4) DISMISSIBLE OVERLAY LIFECYCLE  (drawers, modals, popovers, menus)
     Owns: open class, aria-hidden, scroll-lock, focus trap + restore, and a
     stack so Esc / outside-click only affect the top-most open panel.
     ═══════════════════════════════════════════════════════════════════════ */

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),' +
                  '[tabindex]:not([tabindex="-1"])';
  var stack = [];  // open panels, top-most last

  function openClassOf(panel) { return panel.getAttribute('data-wui-open-class') || 'is-open'; }
  function isOpen(panel) { return panel.classList.contains(openClassOf(panel)); }

  WUI.open = function (panel, trigger) {
    if (!panel || isOpen(panel)) return;
    panel.classList.add(openClassOf(panel));
    panel.setAttribute('aria-hidden', 'false');

    var backdrop = panel.hasAttribute('data-wui-backdrop');
    var entry = {
      panel: panel,
      trigger: trigger || null,
      returnFocus: document.activeElement,
      lock: backdrop || panel.hasAttribute('data-wui-lock'),
      trap: backdrop || panel.hasAttribute('data-wui-trap')
    };
    stack.push(entry);

    if (entry.lock) WUI.lockScroll();
    if (entry.trap) {
      var first = panel.querySelector(FOCUSABLE);
      if (first && first.focus) first.focus();
      else if (panel.focus) panel.focus();
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (trigger && panel.hasAttribute('data-wui-anchor')) {
      var anchorSpec = (panel.getAttribute('data-wui-anchor') || 'bottom-start').split('-');
      var anchorOpts = { side: anchorSpec[0] || 'bottom', align: anchorSpec[1] || 'start' };
      var anchorGap    = panel.getAttribute('data-wui-anchor-gap');
      var anchorMargin = panel.getAttribute('data-wui-anchor-margin');
      if (anchorGap    != null) anchorOpts.gap    = parseInt(anchorGap,    10);
      if (anchorMargin != null) anchorOpts.margin = parseInt(anchorMargin, 10);
      WUI.anchor(panel, trigger, anchorOpts);
    }
    panel.dispatchEvent(new CustomEvent('wui:open', { bubbles: true }));
  };

  WUI.close = function (panel) {
    if (!panel || !isOpen(panel)) return;
    panel.classList.remove(openClassOf(panel));
    panel.setAttribute('aria-hidden', 'true');

    var idx = -1;
    for (var i = stack.length - 1; i >= 0; i--) { if (stack[i].panel === panel) { idx = i; break; } }
    var entry = idx > -1 ? stack.splice(idx, 1)[0] : null;
    if (entry) {
      if (entry.lock) WUI.unlockScroll();
      if (entry.trigger) entry.trigger.setAttribute('aria-expanded', 'false');
      if (entry.trap && entry.returnFocus && entry.returnFocus.focus) entry.returnFocus.focus();
    }
    panel.dispatchEvent(new CustomEvent('wui:close', { bubbles: true }));
  };

  WUI.toggle = function (panel, trigger) {
    if (!panel) return;
    if (isOpen(panel)) WUI.close(panel); else WUI.open(panel, trigger);
  };

  /* close on outside / backdrop click — CAPTURE phase, so the very click that
     opens a panel (handled later in bubble) can't immediately close it. */
  document.addEventListener('click', function (e) {
    if (!stack.length) return;
    var entry = stack[stack.length - 1];
    var panel = entry.panel;
    if (panel.hasAttribute('data-wui-no-outside')) return;
    if (entry.trigger && entry.trigger.contains(e.target)) return;   // the toggle itself

    var backdrop = panel.hasAttribute('data-wui-backdrop');
    var outside = backdrop ? (e.target === panel)          // clicked the full-screen wrapper
                           : !panel.contains(e.target);    // clicked outside a floating panel
    if (outside) WUI.close(panel);
  }, true);

  /* Esc closes the top-most; Tab is trapped within a trapping panel. */
  document.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var entry = stack[stack.length - 1];
    var panel = entry.panel;

    if (e.key === 'Escape' && !panel.hasAttribute('data-wui-no-esc')) {
      WUI.close(panel);
      return;
    }
    if (e.key === 'Tab' && entry.trap) {
      var f = panel.querySelectorAll(FOCUSABLE);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* declarative: [data-wui-toggle] / [data-wui-dismiss] (bubble phase) */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-wui-toggle]');
    if (toggle) {
      var sel = toggle.getAttribute('data-wui-toggle');
      var panel = sel && document.querySelector(sel);
      if (panel) { e.preventDefault(); WUI.toggle(panel, toggle); }
      return;
    }
    var dismiss = e.target.closest('[data-wui-dismiss]');
    if (dismiss) {
      for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].panel.contains(dismiss)) { e.preventDefault(); WUI.close(stack[i].panel); break; }
      }
    }
  });

  /* declarative: [data-wui-step="up|down"] — themed number stepper.
     Native <input type=number> spinners can't be re-themed, so .wui-number
     hides them (CSS) and supplies +/- buttons. Here we drive the input with
     the native stepUp()/stepDown() (which respect min/max/step) and fire
     input + change so validators / listeners react as if the user typed. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wui-step]');
    if (!btn) return;
    var wrap = btn.closest('.wui-number');
    var input = wrap && wrap.querySelector('input[type="number"]');
    if (!input || input.disabled || input.readOnly) return;
    e.preventDefault();
    try {
      if (btn.getAttribute('data-wui-step') === 'down') { input.stepDown(); }
      else { input.stepUp(); }
    } catch (err) { return; }   /* stepUp/Down throws on a malformed value */
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ═══════════════════════════════════════════════════════════════════════
     5) ACTIVATABLE ITEM  (clickable card / row, WITH the guard)
     A whole element is clickable to "activate" it — EXCEPT clicks on a genuine
     interactive control inside it (button, link, field) or [data-wui-no-activate].
     That guard replaces the per-board check
     ( !closest('.ev-actions-wrap') && !closest('.wui-popover') && … ).

     data-wui-panel="#id" (optional)
       Also opens the named panel on activate. When that panel is closed (by any
       mechanism — Esc, dismiss button, outside click) the active class is cleared
       from the item's group so the selection doesn't linger after dismissal.
     ═══════════════════════════════════════════════════════════════════════ */

  var INTERACTIVE = 'button,a[href],input,select,textarea,label,[data-wui-no-activate]';

  WUI.activate = function (item) {
    if (!item) return;
    var groupSel = item.getAttribute('data-wui-group');
    var active = (item.getAttribute('data-wui-active') || 'is-active').split(/\s+/);
    var group = groupSel       ? document.querySelectorAll(groupSel)
              : item.parentElement ? item.parentElement.children
              :                   [item];
    WUI.selectOne(group, item, active);
    item.dispatchEvent(new CustomEvent('wui:activate', { bubbles: true }));
  };

  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-wui-activate]');
    if (!item) return;
    if (e.target.closest(INTERACTIVE)) return;
    WUI.activate(item);
    var panelSel = item.getAttribute('data-wui-panel');
    if (panelSel) {
      var panel = document.querySelector(panelSel);
      if (panel) {
        var closeClass = panel.getAttribute('data-wui-panel-close-class') || 'is-collapsed';
        var openClass  = panel.getAttribute('data-wui-panel-open-class');
        panel.classList.remove(closeClass);
        if (openClass) panel.classList.add(openClass);
        panel.dispatchEvent(new CustomEvent('wui:panelopen', { bubbles: true, detail: { trigger: item } }));
      }
    }
  });

  /* [data-wui-panel-close="#id"] — collapse the linked split panel and clear active items. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wui-panel-close]');
    if (!btn) return;
    var panel = document.querySelector(btn.getAttribute('data-wui-panel-close') || '');
    if (!panel) return;
    var closeClass = panel.getAttribute('data-wui-panel-close-class') || 'is-collapsed';
    var openClass  = panel.getAttribute('data-wui-panel-open-class');
    panel.classList.add(closeClass);
    if (openClass) panel.classList.remove(openClass);
    panel.dispatchEvent(new CustomEvent('wui:panelclose', { bubbles: true }));
  });

  /* Clear the roving active class when the linked split panel closes (wui:panelclose)
     or when a linked dismissible overlay closes (wui:close — backwards compat). */
  function clearPanelItems(id) {
    var items = document.querySelectorAll('[data-wui-activate][data-wui-panel="#' + id + '"]');
    Array.prototype.forEach.call(items, function (item) {
      var active = (item.getAttribute('data-wui-active') || 'is-active').split(/\s+/);
      var groupSel = item.getAttribute('data-wui-group');
      var group = groupSel           ? document.querySelectorAll(groupSel)
                : item.parentElement ? item.parentElement.children
                :                      [item];
      WUI.selectOne(group, null, active);
    });
  }
  document.addEventListener('wui:panelclose', function (e) { if (e.target.id) clearPanelItems(e.target.id); });
  document.addEventListener('wui:close',      function (e) { if (e.target.id) clearPanelItems(e.target.id); });

  /* ═══════════════════════════════════════════════════════════════════════
     6) COLLAPSIBLE  (inline expand/collapse — no overlay semantics)
     [data-wui-collapse] toggles `is-open` on the nearest [data-wui-collapsible]
     (or data-wui-collapse="#id"). In-flow content, so deliberately NO Esc /
     outside-click — unlike the dismissible overlays above.

     XSL note: data-wui-collapse="true" is valid (XML boolean) — treated the same
     as no value (finds nearest [data-wui-collapsible]). Only strings starting with
     #, ., or [ are treated as a CSS selector.
     ═══════════════════════════════════════════════════════════════════════ */

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-wui-collapse]');
    if (!trigger) return;
    var sel = trigger.getAttribute('data-wui-collapse');
    var isSelector = sel && /^[#.[[]/.test(sel);
    var target = isSelector ? document.querySelector(sel) : trigger.closest('[data-wui-collapsible]');
    if (!target) return;
    var open = target.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* Set initial aria-expanded on all collapsible triggers so screen readers and
     the CSS chevron rotation are correct before the first click. */
  WUI.ready(function () {
    var triggers = document.querySelectorAll('[data-wui-collapse]');
    for (var i = 0; i < triggers.length; i++) {
      var trigger = triggers[i];
      var sel = trigger.getAttribute('data-wui-collapse');
      var isSelector = sel && /^[#.[[]/.test(sel);
      var target = isSelector ? document.querySelector(sel) : trigger.closest('[data-wui-collapsible]');
      if (target) trigger.setAttribute('aria-expanded', target.classList.contains('is-open') ? 'true' : 'false');
    }
  });

  /* ═══════════════════════════════════════════════════════════════════════
     7) SEGMENT / VIEW SWITCH  (segmented control, tab bar, view toggle)
     A group where exactly one item is active. Click an item → it becomes active,
     siblings clear, and `wui:select` fires (detail.value). Absorbs view-toggle,
     basemap-picker, header-tab patterns.

       <div data-wui-segment data-wui-active="active">
         <button data-wui-value="map">…</button>
         <button data-wui-value="list" class="active">…</button>
       </div>
       document.addEventListener('wui:select', function (e) {
         if (e.target.closest('#view-toggle')) switchView(e.detail.value);
       });

     VIEW SWITCH — group views by NAME (data-wui-view-group), so the switch is tied to the
     views themselves, NOT to whatever wrapper happens to contain them. WUI.showView('<group>',
     name) shows the matching view, hides the rest, and moves WebEOC's updatesection onto the
     shown one (WebEOC reads the LIVE attribute, so the client-side move is enough). Put
     data-wui-views="<group>" on the segment to wire it automatically.

       <div data-wui-segment data-wui-active="active" data-wui-views="records">
         <button data-wui-value="cards" class="active">Cards</button>
         <button data-wui-value="table">Table</button>
       </div>
       <!-- the views can sit ANYWHERE; only group + view names bind them -->
       <div data-wui-view-group="records" data-wui-view="cards" id="card-list" updatesection="true"> …repeat… </div>
       <div data-wui-view-group="records" data-wui-view="table" id="log-list" style="display: none"> …repeat… </div>

     Put data-wui-view ON the element WebEOC actually refreshes — the one with the id +
     eocrepeatallrecords (the scroll-area), NOT a wrapper around it. That element gains/loses
     updatesection. CALL showView ONCE ON LOAD too, to set the initial state in JS rather than
     rely on the markup. Fires `wui:viewchange`. (Back-compat: showView(container-element-or-
     selector, name) still scopes descendant [data-wui-view].) (XSL: initially-hidden view uses
     style="display: none"; updatesection="true" quoted; refreshid → the view it lives in.)
     ═══════════════════════════════════════════════════════════════════════ */

  /* scope = a view-GROUP name (matches [data-wui-view-group="<scope>"] — the views can live
     ANYWHERE in the DOM, no shared wrapper needed) OR, for back-compat, a container element /
     selector that scopes its descendant [data-wui-view]. Prefer the group name: it ties the
     switch to the views themselves, not to some ancestor that happens to contain them. */
  WUI.showView = function (scope, name) {
    var views = null, host = document;
    if (typeof scope === 'string') {
      views = document.querySelectorAll('[data-wui-view-group="' + scope + '"]'); // group name
      if (!views.length) {                                                        // else: container selector
        host = document.querySelector(scope);
        views = host ? host.querySelectorAll('[data-wui-view]') : null;
      }
    } else if (scope) {                                                           // container element
      host = scope;
      views = scope.querySelectorAll('[data-wui-view]');
    }
    if (!views || !views.length) return;
    Array.prototype.forEach.call(views, function (v) {
      var on = v.getAttribute('data-wui-view') === name;
      v.style.display = on ? '' : 'none';              // inline display beats stylesheet, so this
                                                       // hides flex/grid views too (the [hidden]
                                                       // attr would be overridden by author display)
      if (on) v.setAttribute('updatesection', 'true'); // WebEOC reads the LIVE attribute, so
      else v.removeAttribute('updatesection');         // moving it client-side is all it takes
    });
    (host || document).dispatchEvent(new CustomEvent('wui:viewchange', { bubbles: true, detail: { value: name } }));
  };

  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-wui-value]');
    if (!item) return;
    var group = item.closest('[data-wui-segment]');
    if (!group) return;
    var value = item.getAttribute('data-wui-value');
    WUI.selectOne(group.querySelectorAll('[data-wui-value]'), item, group.getAttribute('data-wui-active') || 'active');
    var viewsSel = group.getAttribute('data-wui-views');
    if (viewsSel) WUI.showView(viewsSel, value);       // optional: also switch the views
    item.dispatchEvent(new CustomEvent('wui:select', { bubbles: true, detail: { value: value } }));
  });

  /* ═══════════════════════════════════════════════════════════════════════
     8) EXPANDABLE ROW  (log / table row → inline detail)
     Click a [data-wui-row] to toggle its `is-open` — CSS reveals the detail
     that follows it. Clicks on a control inside the row are ignored (same guard
     as activate). Independent — no accordion; many rows can be open at once.
     Keep the detail OUTSIDE the [data-wui-row] element (a sibling), so clicks in
     it — including its action buttons — never toggle the row.

       <div class="wui-log-item">
         <div class="wui-log-row" data-wui-row="true"> …cells… </div>
         <div class="wui-log-detail"> …description, actions… </div>
       </div>
       CSS: .wui-log-row.is-open ~ .wui-log-detail { display: block; }
     ═══════════════════════════════════════════════════════════════════════ */

  document.addEventListener('click', function (e) {
    var row = e.target.closest('[data-wui-row]');
    if (!row) return;
    if (e.target.closest(INTERACTIVE)) return;   // don't toggle when a control was clicked
    var open = row.classList.toggle('is-open');
    row.setAttribute('aria-expanded', open ? 'true' : 'false');
    row.dispatchEvent(new CustomEvent('wui:rowtoggle', { bubbles: true, detail: { open: open } }));
  });

  /* ═══════════════════════════════════════════════════════════════════════
     9) SECTION OBSERVER & PROGRAMMATIC REFRESH
     Utilities for WebEOC updatesection integration:

     WUI.observeSection(target, callback)
       Passive watcher. Fires callback() whenever WebEOC replaces the
       element's innerHTML (on section refresh) OR the element itself
       (full-element replacement by updatesection). Uses MutationObserver
       with childList:true (NOT subtree) on both the element and its parent —
       the same pattern proven in Display - Kanban Tasks. Safe to call N
       times per view for N independent sections. Callback must be
       idempotent: WebEOC can fire more than one mutation per refresh cycle.

     WUI.refreshSection(target, opts)
       Active trigger. jQuery AJAX GET to the current view URL (or opts.url),
       parses the response with DOMParser, extracts the matching element by id,
       swaps innerHTML. Fires wui:sectionrefresh after swap. The MutationObserver
       registered via observeSection also fires — make callbacks idempotent.
       Requires jQuery ($ must be available). opts: { url, data, before, done, error }.
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Watch a WebEOC updatesection element for DOM refreshes.
   * Fires callback() after each WebEOC-triggered or programmatic replacement.
   *
   * @param  {Element|string} target   - updatesection element or CSS selector
   * @param  {function}       callback - called after each DOM refresh (no args)
   * @returns {{ disconnect: function }}
   */
  WUI.observeSection = function (target, callback) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || typeof callback !== 'function') return { disconnect: function () {} };

    var observer = new MutationObserver(function () {
      callback();
    });

    /* childList only — catches innerHTML swap and full element replacement.
       NOT subtree: JS-driven grandchild mutations (card moves, class toggles,
       TomSelect inits) never re-trigger. Same guarantee as Kanban pattern. */
    observer.observe(el, { childList: true });
    if (el.parentElement) {
      observer.observe(el.parentElement, { childList: true });
    }

    return { disconnect: function () { observer.disconnect(); } };
  };

  /**
   * Programmatically refresh a single WebEOC updatesection element via jQuery AJAX.
   * Fetches the view URL, extracts the matching section from the response by id,
   * swaps innerHTML, fires wui:sectionrefresh, then calls opts.done.
   * The MutationObserver from observeSection also fires — make callbacks idempotent.
   * Requires jQuery ($ global).
   *
   * @param {Element|string} target           - updatesection element or CSS selector (must have id)
   * @param {object}         [opts]
   * @param {string}         [opts.url]       - fetch URL (default: window.location.href)
   * @param {object}         [opts.data]      - query params passed to $.ajax
   * @param {function}       [opts.before]    - called before fetch, receives section element
   * @param {function}       [opts.done]      - called after DOM swap, receives section element
   * @param {function}       [opts.error]     - called on AJAX failure, receives jqXHR, status
   */
  WUI.refreshSection = function (target, opts) {
    if (typeof $ === 'undefined') {
      console.warn('WUI.refreshSection: jQuery ($) is required but not found');
      return;
    }
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !el.id) {
      console.warn('WUI.refreshSection: target must resolve to an element with an id');
      return;
    }

    opts = $.extend({ url: window.location.href, data: {}, before: null, done: null, error: null }, opts);

    if (typeof opts.before === 'function') opts.before(el);

    $.ajax({
      url:    opts.url,
      method: 'GET',
      data:   opts.data,
      success: function (html) {
        /* DOMParser handles full HTML documents safely.
           jQuery $(html) strips <html>/<head> and may execute scripts. */
        var doc     = new DOMParser().parseFromString(html, 'text/html');
        var freshEl = doc.getElementById(el.id);

        if (!freshEl) {
          console.warn('WUI.refreshSection: #' + el.id + ' not found in response');
          return;
        }

        /* innerHTML swap keeps element identity intact for any live observer.
           outerHTML replace would stale the el reference and confuse the
           parent-watching observer. */
        el.innerHTML = freshEl.innerHTML;

        el.dispatchEvent(new CustomEvent('wui:sectionrefresh', {
          bubbles: true, detail: { el: el }
        }));

        if (typeof opts.done === 'function') opts.done(el);
      },
      error: function (xhr, status) {
        if (typeof opts.error === 'function') opts.error(xhr, status);
      },
    });
  };

  /* ═══════════════════════════════════════════════════════════════════════
     10) STICKY TABLE HEADER STATE  (transparent-at-rest → opaque-when-stuck)
     A cards table's sticky <thead> is transparent at rest (so it shows whatever
     backdrop it sits on, container-agnostic) but must go opaque while scrolling
     or rows bleed through it. This AUTO-BINDS every .wui-table-cards (no per-view
     attribute) — and also any [data-wui-sticky-head="true"] table — adding the
     class .wui-sticky-managed to the <thead> (CSS then makes the header
     transparent) plus a 0-height sentinel watched with an IntersectionObserver
     that toggles .is-stuck the moment the header pins to the top of its scroll
     container (CSS swaps it back to opaque).

     Until JS runs (or if IntersectionObserver is absent) the header stays opaque
     via the CSS fallback, so it never bleeds. Needs a scrolling ancestor
     (overflow-y: auto|scroll|overlay — e.g. .wui-scroll-area); falls back to the
     viewport. Idempotent + re-scans after WebEOC section refreshes / view switches.

     WUI.initStickyHeaders([root])   bind any unbound cards / [data-wui-sticky-head] tables
     ═══════════════════════════════════════════════════════════════════════ */

  /* Nearest scrolling ancestor, or null for the viewport. Mirrors where a
     position:sticky thead actually pins. */
  function wuiScrollParent(el) {
    var node = el && el.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      var oy = '';
      try { oy = window.getComputedStyle(node).overflowY; } catch (e) {}
      if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return node;
      node = node.parentElement;
    }
    return null;
  }

  WUI.initStickyHeaders = function (root) {
    if (typeof IntersectionObserver === 'undefined') return;   /* no occlusion swap on ancient engines — CSS keeps it safe */
    var scope = (root && root.querySelectorAll) ? root : document;
    var tables = scope.querySelectorAll('.wui-table-cards, [data-wui-sticky-head="true"]');
    Array.prototype.forEach.call(tables, function (table) {
      if (table.getAttribute('data-wui-sticky-bound') === 'true') return;
      var thead = table.tHead;
      if (!thead || !table.parentNode) return;
      table.setAttribute('data-wui-sticky-bound', 'true');
      thead.classList.add('wui-sticky-managed');   /* CSS: header transparent at rest */

      /* sentinel sits right above the header; when it scrolls out the top of the
         scrollport the header has pinned. A sibling div (NOT inside the table). */
      var sentinel = document.createElement('div');
      sentinel.className = 'wui-sticky-sentinel';
      sentinel.setAttribute('aria-hidden', 'true');
      table.parentNode.insertBefore(sentinel, table);

      var scroller = wuiScrollParent(table);
      var io = new IntersectionObserver(function (entries) {
        var e = entries[entries.length - 1];
        var top = e.rootBounds ? e.rootBounds.top : 0;
        var stuck = !e.isIntersecting && e.boundingClientRect.top <= top;
        thead.classList.toggle('is-stuck', stuck);
      }, { root: scroller, threshold: 0 });
      io.observe(sentinel);
    });
  };

  WUI.ready(function () { WUI.initStickyHeaders(); });
  document.addEventListener('wui:sectionrefresh', function () { WUI.initStickyHeaders(); });
  document.addEventListener('wui:viewchange',     function () { WUI.initStickyHeaders(); });

  /* ── §11. Toast / Snackbar ─────────────────────────────────────────────────
     Transient notifications. Imperative API; DOM is created on demand and torn
     down after the exit transition. Skinned by weoc-feedback.css §5. No GSAP
     dependency (CSS transitions + WUI.afterTransition). Position regions are
     fixed and self-managing (created on first use, removed when emptied).

       WUI.toast(message[, opts])     corner toast; returns a handle { el, dismiss }
       WUI.snackbar(message[, opts])  bottom-center, single-at-a-time, inline action
       WUI.dismissToast(handle|el)    dismiss one
       WUI.dismissToasts()            dismiss all live toasts/snackbars

     opts: { variant, position, duration, icon, title, dismissible, action }
       variant     '' | primary | info | success | warning | danger  (drives rail + icon)
       position    top-right (default) | top-left | top-center | bottom-right |
                   bottom-left | bottom-center   (ignored for snackbar → bottom-center)
       duration    ms before auto-dismiss; 0 = sticky. Default 4000 (toast) / 6000 (snackbar).
                   Paused while the pointer is over the toast.
       icon        material-symbol name; auto per variant, null to omit
       title       optional bold heading above the message
       dismissible show a close button (default true)
       action      string label, or { label, onClick(handle) }. Fires wui:toast:action.

     Events (bubble on the toast element): wui:toast:show / wui:toast:dismiss /
     wui:toast:action. detail.toast = the element.
     ──────────────────────────────────────────────────────────────────────── */
  var TOAST_ICONS = {
    primary: 'info', info: 'info', success: 'check_circle',
    warning: 'warning', danger: 'error', neutral: 'notifications'
  };
  var TOAST_DEFAULT_MS = 4000;
  var SNACKBAR_DEFAULT_MS = 6000;
  var TOAST_STACK_CAP = 5;
  var toastRegions = {};   /* position -> region element */

  function toastRegion(position) {
    var pos = position || 'top-right';
    if (toastRegions[pos] && document.body.contains(toastRegions[pos])) return toastRegions[pos];
    var region = document.createElement('div');
    region.className = 'wui-toast-region ' + pos;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(region);
    toastRegions[pos] = region;
    return region;
  }

  function toastEmit(el, name) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { toast: el } }));
  }

  function showToast(message, opts, isSnackbar) {
    opts = opts || {};
    var position = isSnackbar ? 'bottom-center' : (opts.position || 'top-right');
    var region = toastRegion(position);
    var variant = opts.variant || '';

    var el = document.createElement('div');
    el.className = (isSnackbar ? 'wui-toast wui-snackbar' : 'wui-toast') + (variant ? ' ' + variant : '');
    el.setAttribute('role', variant === 'danger' ? 'alert' : 'status');

    /* icon — snackbars are icon-less unless a variant or explicit icon is given */
    var iconName = opts.icon != null ? opts.icon
                 : (variant ? TOAST_ICONS[variant] : (isSnackbar ? null : TOAST_ICONS.neutral));
    if (iconName) {
      var icon = document.createElement('span');
      icon.className = 'wui-toast-icon material-symbols-outlined';
      icon.textContent = iconName;
      el.appendChild(icon);
    }

    var body = document.createElement('div');
    body.className = 'wui-toast-body';
    if (opts.title) {
      var title = document.createElement('div');
      title.className = 'wui-toast-title';
      title.textContent = opts.title;
      body.appendChild(title);
    }
    var msg = document.createElement('div');
    msg.className = 'wui-toast-msg';
    msg.textContent = message == null ? '' : String(message);
    body.appendChild(msg);
    el.appendChild(body);

    var handle = { el: el, dismiss: function () {} };
    var timer = null, dismissed = false;
    var duration = opts.duration != null ? opts.duration
                 : (isSnackbar ? SNACKBAR_DEFAULT_MS : TOAST_DEFAULT_MS);

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function startTimer() { clearTimer(); if (duration > 0) timer = setTimeout(dismiss, duration); }
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimer();
      el.classList.add('is-leaving');
      el.classList.remove('is-visible');
      toastEmit(el, 'wui:toast:dismiss');
      WUI.afterTransition(el, function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var reg = toastRegions[position];
        if (reg && !reg.children.length && reg.parentNode) {
          reg.parentNode.removeChild(reg);
          delete toastRegions[position];
        }
      }, 400);
    }
    handle.dismiss = dismiss;

    /* action button */
    if (opts.action) {
      var actLabel = typeof opts.action === 'string' ? opts.action : (opts.action.label || 'Action');
      var actFn = (opts.action && typeof opts.action === 'object') ? opts.action.onClick : null;
      var actBtn = document.createElement('button');
      actBtn.type = 'button';
      actBtn.className = 'wui-toast-action';
      actBtn.textContent = actLabel;
      actBtn.addEventListener('click', function () {
        toastEmit(el, 'wui:toast:action');
        if (typeof actFn === 'function') { try { actFn(handle); } catch (e) {} }
        dismiss();
      });
      /* snackbar keeps the action inline on the row; toast stacks it under the body */
      if (isSnackbar) el.appendChild(actBtn); else body.appendChild(actBtn);
    }

    /* close button */
    if (opts.dismissible !== false) {
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'wui-toast-close';
      closeBtn.setAttribute('aria-label', 'Dismiss');
      closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
      closeBtn.addEventListener('click', dismiss);
      el.appendChild(closeBtn);
    }

    /* snackbar is single-at-a-time — dismiss any open snackbar first */
    if (isSnackbar) {
      var open = region.querySelectorAll('.wui-snackbar');
      for (var s = 0; s < open.length; s++) {
        if (open[s].__wuiToast) open[s].__wuiToast.dismiss();
      }
    }

    el.__wuiToast = handle;
    region.appendChild(el);

    /* stack cap — dismiss the oldest live toasts beyond the cap */
    var live = region.querySelectorAll('.wui-toast:not(.is-leaving)');
    if (live.length > TOAST_STACK_CAP) {
      for (var k = 0; k < live.length - TOAST_STACK_CAP; k++) {
        if (live[k].__wuiToast) live[k].__wuiToast.dismiss();
      }
    }

    /* force reflow, then flip to visible so the enter transition runs */
    el.offsetWidth;                 /* eslint-disable-line no-unused-expressions */
    el.classList.add('is-visible');
    toastEmit(el, 'wui:toast:show');

    /* pause auto-dismiss while hovered */
    el.addEventListener('mouseenter', clearTimer);
    el.addEventListener('mouseleave', startTimer);
    startTimer();

    return handle;
  }

  WUI.toast = function (message, opts) { return showToast(message, opts, false); };
  WUI.snackbar = function (message, opts) { return showToast(message, opts, true); };
  WUI.dismissToast = function (ref) {
    if (!ref) return;
    if (typeof ref.dismiss === 'function') ref.dismiss();
    else if (ref.nodeType === 1 && ref.__wuiToast) ref.__wuiToast.dismiss();
  };
  WUI.dismissToasts = function () {
    for (var pos in toastRegions) {
      if (!toastRegions.hasOwnProperty(pos)) continue;
      var items = toastRegions[pos].querySelectorAll('.wui-toast:not(.is-leaving)');
      for (var i = 0; i < items.length; i++) {
        if (items[i].__wuiToast) items[i].__wuiToast.dismiss();
      }
    }
  };

})(window, document);
