import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     10) VIEW MODE  (tabs <-> stacked/list toggle)
     [data-wui-view-mode="<group>"] on a toggle BUTTON. Switches a segment group
     between tabbed (engine-driven) and stacked "list" mode. In list mode: adds
     .is-list-mode to the container (shared CSS stacks all .wui-tab-panel), hides
     the segment strip + its auto-injected .wui-hdr-tabs-wrap (arrows go too),
     and swaps the button icon (view_agenda<->tab) + label to the TARGET mode's
     i18n key (List<stem>/Tab<stem>). Persists to data-wui-vm-persist. On return
     to tabs, re-asserts the active panel via WUI.showView. Delegated init on load
     + WUI.initViewMode(btn). Idempotent per button. Localization-native, RTL-safe.
     ═══════════════════════════════════════════════════════════════════════ */

  WUI.initViewMode = function (btn) {
    if (!btn || btn.__wuiViewMode) return;
    btn.__wuiViewMode = true;

    var group = btn.getAttribute('data-wui-view-mode');
    if (!group) return;
    var persistKey = btn.getAttribute('data-wui-vm-persist') || '';
    var stem = btn.getAttribute('data-wui-vm-label') || 'View';
    var containerSel = btn.getAttribute('data-wui-vm-container') || '.wui-det-body';
    var container = btn.closest(containerSel) || document.querySelector(containerSel);
    if (!container) return;

    var strip = document.querySelector('[data-wui-segment][data-wui-views="' + group + '"]');
    var wrap = strip ? (strip.closest('.wui-hdr-tabs-wrap') || strip) : null;
    var iconEl = btn.querySelector('[data-wui-vm-icon]');
    var textEl = btn.querySelector('[data-wui-vm-text]');

    function apply(list) {
      container.classList.toggle('is-list-mode', list);
      if (wrap) wrap.style.display = list ? 'none' : '';
      if (iconEl) iconEl.textContent = list ? 'tab' : 'view_agenda';
      if (textEl && WUI.i18n && WUI.i18n.mark) WUI.i18n.mark(textEl, (list ? 'Tab' : 'List') + stem);
      if (!list && strip) {
        var active = strip.querySelector('[data-wui-value].active') || strip.querySelector('[data-wui-value]');
        if (active) WUI.showView(group, active.getAttribute('data-wui-value'));
      }
    }

    btn.addEventListener('click', function () {
      var list = !container.classList.contains('is-list-mode');
      apply(list);
      if (persistKey) { try { localStorage.setItem(persistKey, list ? 'list' : 'tabs'); } catch (e) {} }
    });

    var saved = '';
    if (persistKey) { try { saved = localStorage.getItem(persistKey) || ''; } catch (e) {} }
    apply(saved === 'list');
  };

  function wuiBootViewMode() {
    var btns = document.querySelectorAll('[data-wui-view-mode]');
    for (var i = 0; i < btns.length; i++) WUI.initViewMode(btns[i]);
  }
  // Run immediately for the (typical) case where this script executes after
  // the buttons already exist in the DOM, and also via WUI.ready as a fallback
  // for head-placed/deferred script tags. initViewMode() is idempotent per
  // button, so the redundant second pass is a safe no-op.
  wuiBootViewMode();
  WUI.ready(wuiBootViewMode);
