import { WUI, INTERACTIVE } from '../core/wui.js';

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
