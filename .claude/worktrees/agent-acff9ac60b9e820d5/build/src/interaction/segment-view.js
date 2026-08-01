import { WUI } from '../core/wui.js';

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
      // One-time snapshot: a view "participates" in updatesection iff it AUTHORED
      // the attribute. Remember it in a stable flag so later removals don't erase
      // the participant status.
      if (!v.hasAttribute('data-wui-us-init')) {
        if (v.hasAttribute('updatesection')) v.setAttribute('data-wui-updatesection', '');
        v.setAttribute('data-wui-us-init', '');
      }
      var on = v.getAttribute('data-wui-view') === name;
      v.style.display = on ? '' : 'none';              // inline display beats stylesheet
      v.classList.toggle('active', on);                // components whose CSS defaults to
                                                        // display:none and keys visibility off
                                                        // .active (e.g. .wui-tab-panel) need this;
                                                        // it's a no-op for components (like
                                                        // .wui-scroll-area) with no such rule.
      if (v.hasAttribute('data-wui-updatesection')) {  // only participants get the move
        if (on) v.setAttribute('updatesection', 'true');
        else v.removeAttribute('updatesection');
      }
    });
    // Keep the segment control (tab header) in sync when showView is called
    // directly instead of via a real click — validator jump-to-invalid-tab,
    // deep-link opens, etc. The click handler below does this too, but only
    // for clicks; callers that invoke showView() programmatically need it here.
    if (typeof scope === 'string') {
      var segEl = document.querySelector('[data-wui-views="' + scope + '"]');
      if (segEl) {
        var target = segEl.querySelector('[data-wui-value="' + name + '"]');
        if (target) {
          WUI.selectOne(segEl.querySelectorAll('[data-wui-value]'), target, segEl.getAttribute('data-wui-active') || 'active');
        }
      }
    }
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
