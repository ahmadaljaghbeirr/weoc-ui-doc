import { WUI } from './wui.js';

/* §RESPONSIVE — WUI.responsive.observe(el, onResize, opts) -> { disconnect() }
   One ResizeObserver per call site (not pooled — cheap at dashboard widget
   counts, simpler than managing a shared registry).

   - rAF-coalesced: multiple entries firing within one frame collapse into a
     single onResize call.
   - Skip-if-unchanged: rounds width/height, no-ops if identical to last call.
   - Min-size guard: opts.minWidth / opts.minHeight — below threshold,
     onResize fires with { tooSmall: true } instead of usable dimensions, so
     callers can render a defined empty-state instead of broken geometry.
   - Falls back to a throttled window-resize listener when ResizeObserver is
     unavailable (mirrors interaction/tab-scroll.js's existing fallback). */
WUI.responsive = {};

WUI.responsive.observe = function (el, onResize, opts) {
  opts = opts || {};
  var minWidth  = opts.minWidth  || 0;
  var minHeight = opts.minHeight || 0;

  var lastW = null;
  var lastH = null;
  var rafId = null;
  var pendingW = 0;
  var pendingH = 0;
  var disconnected = false;

  function flush() {
    rafId = null;
    if (disconnected) { return; }

    var w = Math.round(pendingW);
    var h = Math.round(pendingH);
    if (w === lastW && h === lastH) { return; }
    lastW = w;
    lastH = h;

    onResize({ tooSmall: (w < minWidth || h < minHeight), width: w, height: h });
  }

  function schedule(w, h) {
    pendingW = w;
    pendingH = h;
    if (rafId === null) { rafId = requestAnimationFrame(flush); }
  }

  var ro = null;
  var fallbackHandler = null;

  if (typeof window.ResizeObserver !== 'undefined') {
    ro = new window.ResizeObserver(function (entries) {
      if (disconnected || !entries.length) { return; }
      var box = entries[0].contentRect;
      schedule(box.width, box.height);
    });
    ro.observe(el);
  } else {
    var measure = function () {
      var r = el.getBoundingClientRect();
      schedule(r.width, r.height);
    };
    fallbackHandler = WUI.throttle(measure, 60);
    window.addEventListener('resize', fallbackHandler);
    measure();
  }

  return {
    disconnect: function () {
      disconnected = true;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      if (ro) { ro.disconnect(); }
      if (fallbackHandler) { window.removeEventListener('resize', fallbackHandler); }
    }
  };
};
