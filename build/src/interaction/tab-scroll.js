import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     9) TAB SCROLL  (scrollable header tab strip)
     [data-wui-tab-scroll] on a .wui-hdr-tabs strip. Auto-wraps it in
     .wui-hdr-tabs-wrap (if not already) and injects two .wui-fab arrow buttons.
     Toggles .has-left/.has-right on the wrap by scroll position — those classes
     already drive the edge-fade shadows AND the arrow visibility in
     weoc-navigation.css. Arrow click scrolls; wheel scrolls horizontally.
     RTL-safe (abs scrollLeft). Arrow aria-labels via WUI.i18n. Delegated init
     on load + WUI.initTabScroll(el) for JS-built strips. Idempotent per strip.
     ═══════════════════════════════════════════════════════════════════════ */

  WUI.initTabScroll = function (strip) {
    if (!strip || strip.__wuiTabScroll) return;
    strip.__wuiTabScroll = true;

    var wrap = strip.closest('.wui-hdr-tabs-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'wui-hdr-tabs-wrap';
      strip.parentNode.insertBefore(wrap, strip);
      wrap.appendChild(strip);
    }

    function ensureBtn(cls, key, icon) {
      var b = wrap.querySelector('.wui-fab.' + cls);
      if (!b) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = 'wui-fab secondary neon-outline ' + cls;
        b.setAttribute('data-wui-i18n-attr', 'aria-label:' + key);
        var s = document.createElement('span');
        s.className = 'material-symbols-outlined';
        s.textContent = icon;
        b.appendChild(s);
        wrap.appendChild(b);
      }
      return b;
    }
    var left = ensureBtn('tabs-scroll-left', 'ScrollTabsLeft', 'chevron_left');
    var right = ensureBtn('tabs-scroll-right', 'ScrollTabsRight', 'chevron_right');
    if (WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(wrap);

    function update() {
      var max = strip.scrollWidth - strip.clientWidth;
      if (max <= 1) { wrap.classList.remove('has-left', 'has-right'); return; }
      // Map to PHYSICAL left/right overflow so each arrow + edge-shadow sits on the
      // correct side in BOTH LTR and RTL. Modern engines (Chromium/Firefox) use the
      // negative-scrollLeft RTL convention: scrollLeft is 0 at the start (right) edge
      // and decreases toward the left. leftHidden / rightHidden = px scrolled off
      // each physical edge; the left arrow reveals left-hidden content, the right
      // arrow reveals right-hidden content — direction-agnostic.
      var sl = strip.scrollLeft;
      var rtl = (window.getComputedStyle(strip).direction === 'rtl') ||
                (document.documentElement.dir === 'rtl');
      var leftHidden  = rtl ? (max + sl) : sl;       // in RTL sl <= 0
      var rightHidden = rtl ? (-sl)      : (max - sl);
      wrap.classList.toggle('has-left',  leftHidden > 1);
      wrap.classList.toggle('has-right', rightHidden > 1);
    }

    var STEP = 160;
    left.addEventListener('click', function () { strip.scrollBy({ left: -STEP, behavior: 'smooth' }); });
    right.addEventListener('click', function () { strip.scrollBy({ left: STEP, behavior: 'smooth' }); });
    strip.addEventListener('scroll', update);
    strip.addEventListener('wheel', function (e) {
      if (e.deltaY !== 0) { e.preventDefault(); strip.scrollLeft += e.deltaY; }
    });

    if (window.ResizeObserver) { new window.ResizeObserver(update).observe(strip); }
    else { window.addEventListener('resize', WUI.throttle(update, 60)); }
    document.documentElement.addEventListener('wui:langchange', function () {
      if (WUI.i18n && WUI.i18n.apply) WUI.i18n.apply(wrap);
      setTimeout(update, 0);
    });

    update();
  };

  function wuiBootTabScroll() {
    var strips = document.querySelectorAll('[data-wui-tab-scroll]');
    for (var i = 0; i < strips.length; i++) WUI.initTabScroll(strips[i]);
  }
  // Run immediately for the (typical) case where this script executes after
  // the strips already exist in the DOM, and also via WUI.ready as a fallback
  // for head-placed/deferred script tags. initTabScroll() is idempotent per
  // strip, so the redundant second pass is a safe no-op.
  wuiBootTabScroll();
  WUI.ready(wuiBootTabScroll);
