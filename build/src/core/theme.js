import { WUI } from './wui.js';

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

  /* ── Declarative label/icon swap (optional) ────────────────────────────────
     A [data-wui-theme-toggle] button MAY carry two child markers plus board-
     supplied swap values, so a board gets a self-relabeling toggle with no
     board-local JS: a child [data-wui-theme-label] (textContent swapped) and/or
     a child [data-wui-theme-icon] (textContent swapped — this project uses
     ligature icon fonts, e.g. Material Symbols, where the icon name IS the
     text). Values come from data attributes on the TOGGLE itself, named for
     the theme they represent — data-wui-theme-label-light/-dark (i18n keys,
     via WUI.i18n.t(key, key)) and data-wui-theme-icon-light/-dark (literal
     ligature strings — icons aren't translated). data-wui-theme-aria-light/
     -dark (i18n keys) optionally set the button's own aria-label. A button's
     shown label/icon/aria is always the ONE NAMED FOR THE THEME A CLICK WOULD
     SWITCH TO (e.g. while the page is light, the "-dark" set is shown — "Dark
     Mode" / dark_mode — matching the existing HomePage markup convention).
     Entirely optional: any toggle missing the child markers or data
     attributes is skipped silently, never throws. Runs once at initial load
     and on every wui:themechange (a sibling listener to the TinyMCE one
     below — that one stays untouched). */
  function wuiThemeToggleSwap(theme) {
    var target = (theme === 'dark') ? 'light' : 'dark';   // the theme a click would switch TO
    var toggles = document.querySelectorAll('[data-wui-theme-toggle]');
    var i, toggle, labelEl, iconEl, labelKey, iconVal, ariaKey;
    for (i = 0; i < toggles.length; i++) {
      toggle = toggles[i];

      labelEl = toggle.querySelector('[data-wui-theme-label]');
      if (labelEl) {
        labelKey = toggle.getAttribute('data-wui-theme-label-' + target);
        if (labelKey) labelEl.textContent = (window.WUI && WUI.i18n) ? WUI.i18n.t(labelKey, labelKey) : labelKey;
      }

      iconEl = toggle.querySelector('[data-wui-theme-icon]');
      if (iconEl) {
        iconVal = toggle.getAttribute('data-wui-theme-icon-' + target);
        if (iconVal) iconEl.textContent = iconVal;
      }

      ariaKey = toggle.getAttribute('data-wui-theme-aria-' + target);
      if (ariaKey) toggle.setAttribute('aria-label', (window.WUI && WUI.i18n) ? WUI.i18n.t(ariaKey, ariaKey) : ariaKey);
    }
  }

  var wuiInitThemeToggleSwap = function () { wuiThemeToggleSwap(WUI.getTheme()); };
  if (document.readyState !== 'loading') wuiInitThemeToggleSwap();
  else document.addEventListener('DOMContentLoaded', wuiInitThemeToggleSwap);

  document.documentElement.addEventListener('wui:themechange', function (e) {
    wuiThemeToggleSwap(e && e.detail ? e.detail.theme : WUI.getTheme());
  });

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
