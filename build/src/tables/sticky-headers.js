import { WUI } from '../core/wui.js';

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
