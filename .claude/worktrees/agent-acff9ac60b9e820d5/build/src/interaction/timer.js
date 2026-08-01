import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     TIMER  (live elapsed-time ticker)
     [data-wui-elapsed="<iso-8601-or-epoch-ms>"] on a SPAN. Renders elapsed time
     since the given start timestamp and re-renders every 1000ms, in the style
     "1d 02h 03m 04s" (days omitted when zero; hours/mins/secs zero-padded to 2).
     Replaces hand-rolled startTimer()/#det-timer countup code (e.g. ER Details).

       <span data-wui-elapsed="2026-07-13T10:00:00Z"></span>
       WUI.timer(el)                 // reads the start ts off the attribute
       WUI.timer(el, '2026-07-13T10:00:00Z')
       WUI.timer(el, 1752400800000)  // epoch ms also accepted

     WUI.timer(el, startTs) starts (or re-starts) the ticker on `el`. Idempotent
     per element: a prior interval (if any) is always cleared first, so repeat
     calls never leak timers — safe to call again with a new/older `el.__wuiTimer`
     already attached. The ticker self-stops once `el` is no longer attached to
     the document (checked every tick), so removed cards don't keep ticking in
     the background.

     Unit letters (d/h/m/s) are localized via WUI.i18n (TimerDay/TimerHour/
     TimerMin/TimerSec, default en values registered below) so `ar` resources
     can override them. Digits are always plain ASCII — RTL layout is handled
     by CSS/dir on the surrounding markup, not by this module.

     Delegated init on load + WUI.ready fallback, matching every other
     interaction module (view-mode.js, tab-scroll.js, …).
     ═══════════════════════════════════════════════════════════════════════ */

  WUI.i18n.register([
    { lang: 'en', id: 'TimerDay', value: 'd' },
    { lang: 'en', id: 'TimerHour', value: 'h' },
    { lang: 'en', id: 'TimerMin', value: 'm' },
    { lang: 'en', id: 'TimerSec', value: 's' }
  ]);

  function wuiPad2(n) {
    n = Math.floor(n);
    return (n < 10 ? '0' : '') + n;
  }

  /* Accepts an ISO-8601 string, an epoch-ms number, or a numeric string
     (epoch ms as text, e.g. read straight off an attribute). Returns epoch ms
     or null if it can't be parsed. */
  function wuiParseStart(startTs) {
    if (startTs == null || startTs === '') return null;
    if (typeof startTs === 'number') return isNaN(startTs) ? null : startTs;
    var s = String(startTs);
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    var t = new Date(s).getTime();
    return isNaN(t) ? null : t;
  }

  function wuiFormatElapsed(ms) {
    if (!(ms > 0)) ms = 0;
    var totalSec = Math.floor(ms / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    var out = '';
    if (days > 0) out += days + WUI.i18n.t('TimerDay', 'd') + ' ';
    out += wuiPad2(hours) + WUI.i18n.t('TimerHour', 'h') + ' ';
    out += wuiPad2(mins) + WUI.i18n.t('TimerMin', 'm') + ' ';
    out += wuiPad2(secs) + WUI.i18n.t('TimerSec', 's');
    return out;
  }

  WUI.timer = function (el, startTs) {
    if (!el) return;
    // always clear any prior interval first — repeat calls never leak timers
    if (el.__wuiTimer && el.__wuiTimer.interval) clearInterval(el.__wuiTimer.interval);

    var raw = (startTs == null) ? el.getAttribute('data-wui-elapsed') : startTs;
    var start = wuiParseStart(raw);
    if (start == null) { el.__wuiTimer = null; return; }

    var state = { start: start, interval: null };
    el.__wuiTimer = state;

    function tick() {
      if (!document.contains(el)) { clearInterval(state.interval); return; }
      el.textContent = wuiFormatElapsed(Date.now() - state.start);
    }

    tick(); // render immediately, don't wait a full second for the first frame
    state.interval = setInterval(tick, 1000);
    return el;
  };

  WUI.initTimer = function (el) {
    if (!el) return;
    WUI.timer(el);
  };

  function wuiBootTimer() {
    var els = document.querySelectorAll('[data-wui-elapsed]');
    for (var i = 0; i < els.length; i++) WUI.initTimer(els[i]);
  }
  // Run immediately for the (typical) case where this script executes after
  // the elements already exist in the DOM, and also via WUI.ready as a
  // fallback for head-placed/deferred script tags. WUI.timer() always clears
  // its own prior interval before starting a new one, so the redundant second
  // pass is a safe no-op (same start ts in, same rendered value out).
  wuiBootTimer();
  WUI.ready(wuiBootTimer);
