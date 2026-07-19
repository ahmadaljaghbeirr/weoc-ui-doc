import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     11) BUSY / LOADING OVERLAY  (WUI.busy / WUI.buttonBusy / data-wui-loading)

     A reusable animated-overlay loader. Two surfaces:
       • WUI.busy(on [, targetEl])  — full-page (no target) or element-scoped
                                      (absolute over targetEl) busy overlay.
       • WUI.buttonBusy(btn, on)    — inline busy state on a single button.

     The overlay markup + the localizable "Please wait" label live HERE (in the
     bundle). The animated energy→TAQA MorphSVG timeline lives in the companion
     script JS/weoc-loader.js (window.WUILoader) which is NOT bundled and loads
     GSAP itself. This module has NO hard dependency on GSAP or on the companion:
     if window.WUILoader is present it is asked to mount() the branded SVG into
     the overlay; if absent, a pure-CSS fallback spinner (.wui-busy-spinner)
     shows instead. Everything degrades to a static, working overlay.

     Declarative: [data-wui-loading] on a <form> shows a busy overlay on submit
     (attribute value optionally a CSS selector to scope the overlay, or "self"
     to scope it over the form); on a <button> it sets that button busy on click.

     i18n keys: LoaderPleaseWait.  Delegated on document + idempotent per target.
     ═══════════════════════════════════════════════════════════════════════ */

  var OVERLAY_CLASS = 'wui-busy-overlay';

  function i18nT(id, fallback) {
    return (WUI.i18n && WUI.i18n.t) ? WUI.i18n.t(id, fallback) : fallback;
  }

  /* Build a fresh overlay: a figure (holds the branded SVG once the companion
     mounts, or the CSS fallback spinner in the meantime) + a localizable label
     with animated dots. The label text lives in a child <span> so WUI.i18n.apply
     (which sets textContent) can re-localize it without clobbering the dots. */
  function buildOverlay() {
    var ov = document.createElement('div');
    ov.className = OVERLAY_CLASS;
    ov.setAttribute('role', 'status');
    ov.setAttribute('aria-live', 'polite');
    ov.setAttribute('aria-busy', 'true');

    var fig = document.createElement('div');
    fig.className = 'wui-busy-figure';
    var spinner = document.createElement('div');
    spinner.className = 'wui-busy-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    fig.appendChild(spinner);
    ov.appendChild(fig);

    var text = document.createElement('div');
    text.className = 'wui-busy-text';
    var lbl = document.createElement('span');
    lbl.setAttribute('data-wui-i18n', 'LoaderPleaseWait');
    lbl.textContent = i18nT('LoaderPleaseWait', 'Please wait');
    var dots = document.createElement('span');
    dots.className = 'wui-busy-dots';
    dots.setAttribute('aria-hidden', 'true');
    text.appendChild(lbl);
    text.appendChild(dots);
    ov.appendChild(text);

    return ov;
  }

  /* Hand the overlay to the companion animation driver if it is on the page.
     Guarded so a broken/absent companion never breaks the busy state. */
  function mountLoader(ov) {
    var L = window.WUILoader;
    if (L && typeof L.mount === 'function') {
      try { L.mount(ov); } catch (e) {}
    }
  }
  function unmountLoader(ov) {
    var L = window.WUILoader;
    if (L && typeof L.unmount === 'function') {
      try { L.unmount(ov); } catch (e) {}
    }
  }

  var fullOverlay = null;   // the single full-page overlay, if any

  function showBusy(target) {
    var ov;
    if (target) {
      if (target.__wuiBusyOverlay) return target.__wuiBusyOverlay;  // idempotent
      ov = buildOverlay();
      ov.classList.add('wui-busy-scoped');
      // Give the target a positioning context so absolute inset:0 covers it.
      var cs = window.getComputedStyle ? window.getComputedStyle(target) : null;
      var pos = cs ? cs.position : (target.style && target.style.position);
      if (!pos || pos === 'static') {
        target.style.position = 'relative';
        target.__wuiBusyPosSet = true;
      }
      target.appendChild(ov);
      target.__wuiBusyOverlay = ov;
      target.setAttribute('aria-busy', 'true');
    } else {
      if (fullOverlay) return fullOverlay;                          // idempotent
      ov = buildOverlay();
      ov.classList.add('wui-busy-fullpage');
      document.body.appendChild(ov);
      fullOverlay = ov;
      if (WUI.lockScroll) WUI.lockScroll();
    }
    if (WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(ov);
    mountLoader(ov);
    return ov;
  }

  function hideBusy(target) {
    var ov = target ? target.__wuiBusyOverlay : fullOverlay;
    if (!ov) return;
    unmountLoader(ov);
    if (ov.parentNode) ov.parentNode.removeChild(ov);
    if (target) {
      target.__wuiBusyOverlay = null;
      target.removeAttribute('aria-busy');
      if (target.__wuiBusyPosSet) { target.style.position = ''; target.__wuiBusyPosSet = false; }
    } else {
      fullOverlay = null;
      if (WUI.unlockScroll) WUI.unlockScroll();
    }
  }

  /* WUI.busy(on [, targetEl]) — show/hide a busy overlay. No targetEl = full
     page; with targetEl = overlay positioned over that element. Returns the
     overlay element on show. */
  WUI.busy = function (on, targetEl) {
    if (on) return showBusy(targetEl || null);
    hideBusy(targetEl || null);
  };

  /* WUI.buttonBusy(btn, on) — disable the button + flag it busy (CSS renders an
     inline spinner off .is-busy). Restores the button's prior disabled state. */
  WUI.buttonBusy = function (btn, on) {
    if (!btn) return;
    if (on) {
      if (btn.__wuiBtnBusy) return;                 // idempotent
      btn.__wuiBtnBusy = true;
      btn.__wuiBtnPrevDisabled = !!btn.disabled;
      btn.disabled = true;
      btn.classList.add('is-busy');
      btn.setAttribute('aria-busy', 'true');
    } else {
      if (!btn.__wuiBtnBusy) return;
      btn.__wuiBtnBusy = false;
      btn.disabled = !!btn.__wuiBtnPrevDisabled;
      btn.classList.remove('is-busy');
      btn.removeAttribute('aria-busy');
    }
  };

  /* Resolve the scope target for a declarative [data-wui-loading] value:
       ""      → full page (null target)
       "self"  → the host element itself
       "<sel>" → the first element matching the CSS selector, else full page   */
  function resolveScope(host, val) {
    if (!val) return null;
    if (val === 'self') return host;
    var el = null;
    try { el = document.querySelector(val); } catch (e) {}
    return el || null;
  }

  /* declarative: form[data-wui-loading] submit → busy overlay. Capture phase so
     the overlay is up before any other submit handler runs. */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.nodeType !== 1 || !form.matches || !form.matches('form[data-wui-loading]')) return;
    WUI.busy(true, resolveScope(form, form.getAttribute('data-wui-loading')));
  }, true);

  /* declarative: button[data-wui-loading] click → button busy. Submit buttons
     inside a data-wui-loading form are covered by the submit handler above, so
     only handle standalone (non-submit) buttons here to avoid double handling. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('button[data-wui-loading],[role="button"][data-wui-loading]') : null;
    if (!btn) return;
    if (btn.type === 'submit' && btn.form) return;
    WUI.buttonBusy(btn, true);
  });
