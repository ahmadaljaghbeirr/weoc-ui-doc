import { WUI } from './wui.js';

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
