import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     11) DIRTY TRACKER  (unsaved-changes guard)
     [data-wui-dirty] on a FORM (or any container). Snapshots the initial
     value of every input/select/textarea inside it, then listens for
     input/change to detect drift from that snapshot. Toggles .is-dirty on
     the form and reveals/hides an associated "save bar" element
     (data-wui-dirty-bar="<selector>", toggles .wui-visible + the `hidden`
     attribute), optionally warns on tab/window close via beforeunload
     (data-wui-dirty-warn — native prompt text is browser-controlled and not
     localizable). If the bar contains a [data-wui-dirty-text] element, its
     label is tagged once via WUI.i18n.mark (key: UnsavedChanges) — the ONLY
     text this module owns; the rest of the bar's contents are the caller's.
     Exposes formEl.__wuiDirty = { isDirty(), reset() } so a save handler can
     re-snapshot after a successful save. Idempotent per form. Delegated init
     on load + WUI.ready.
     ═══════════════════════════════════════════════════════════════════════ */

  var DIRTY_FIELD_SEL = 'input, select, textarea';
  var DIRTY_SKIP_TYPES = { hidden: 1, submit: 1, button: 1, reset: 1 };

  function wuiDirtyFields(form) {
    var all = form.querySelectorAll(DIRTY_FIELD_SEL), out = [], i, el;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (!el.name) continue;
      if (DIRTY_SKIP_TYPES[el.type]) continue;
      out.push(el);
    }
    return out;
  }

  function wuiDirtyValue(el) {
    return (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
  }

  function wuiDirtySnapshot(form) {
    var fields = wuiDirtyFields(form), snap = [], i;
    for (i = 0; i < fields.length; i++) snap.push(wuiDirtyValue(fields[i]));
    return snap;
  }

  function wuiDirtyDiff(form, snap) {
    var fields = wuiDirtyFields(form), i;
    for (i = 0; i < fields.length; i++) {
      if (wuiDirtyValue(fields[i]) !== snap[i]) return true;
    }
    return false;
  }

  WUI.dirtyTracker = function (form, opts) {
    if (!form) return null;
    if (form.__wuiDirty) return form.__wuiDirty;
    opts = opts || {};

    var barSelector = opts.barSelector || form.getAttribute('data-wui-dirty-bar') || '';
    var warnOnLeave = (opts.warnOnLeave != null)
      ? !!opts.warnOnLeave
      : form.hasAttribute('data-wui-dirty-warn');
    var onDirtyChange = opts.onDirtyChange || null;

    var bar = barSelector ? document.querySelector(barSelector) : null;
    var textEl = bar ? bar.querySelector('[data-wui-dirty-text]') : null;
    if (textEl && WUI.i18n && WUI.i18n.mark) WUI.i18n.mark(textEl, 'UnsavedChanges');

    var snap = wuiDirtySnapshot(form);
    var dirty = false;

    function beforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }

    function render() {
      form.classList.toggle('is-dirty', dirty);
      if (bar) {
        bar.classList.toggle('wui-visible', dirty);
        if (dirty) bar.removeAttribute('hidden');
        else bar.setAttribute('hidden', '');
      }
    }

    function setDirty(next) {
      if (next === dirty) return;
      dirty = next;
      render();
      if (warnOnLeave) {
        if (dirty) window.addEventListener('beforeunload', beforeUnload);
        else window.removeEventListener('beforeunload', beforeUnload);
      }
      if (onDirtyChange) onDirtyChange(dirty);
    }

    function check() { setDirty(wuiDirtyDiff(form, snap)); }

    form.addEventListener('input', check);
    form.addEventListener('change', check);

    render(); // establish clean initial state (form.is-dirty off, bar hidden)

    var api = {
      isDirty: function () { return dirty; },
      reset: function () {
        snap = wuiDirtySnapshot(form);
        setDirty(false);
      }
    };
    form.__wuiDirty = api;
    return api;
  };

  function wuiBootDirty() {
    var forms = document.querySelectorAll('[data-wui-dirty]');
    for (var i = 0; i < forms.length; i++) WUI.dirtyTracker(forms[i]);
  }
  // Run immediately for the (typical) case where this script executes after
  // the form already exists in the DOM, and also via WUI.ready as a fallback
  // for head-placed/deferred script tags. dirtyTracker() is idempotent per
  // form, so the redundant second pass is a safe no-op.
  wuiBootDirty();
  WUI.ready(wuiBootDirty);
