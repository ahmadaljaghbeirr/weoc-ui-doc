import { WUI, INTERACTIVE } from '../core/wui.js';

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
