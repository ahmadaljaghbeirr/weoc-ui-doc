import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + (html || '') + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

// Freeze the WINDOW's Date.now() to a fixed anchor so elapsed-time assertions
// never race a real second boundary. Date(arg) construction still delegates to
// the real Date so ISO-string parsing (data-wui-elapsed) is unaffected.
function freezeNow(dom, ts) {
  const RealDate = dom.window.Date;
  function FrozenDate() {
    if (arguments.length) return new RealDate(...arguments);
    return new RealDate(ts);
  }
  FrozenDate.now = () => ts;
  FrozenDate.prototype = RealDate.prototype;
  dom.window.Date = FrozenDate;
}

// Clear the live 1s interval a ticker started, using the SAME jsdom window that
// created it, so no interval keeps Node's event loop alive after the test ends.
function stopTimer(dom, el) {
  if (el && el.__wuiTimer && el.__wuiTimer.interval) dom.window.clearInterval(el.__wuiTimer.interval);
}

test('timer: renders elapsed d/h/m/s immediately from an epoch-ms start (no days)', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  const now = 1_752_400_000_000;
  freezeNow(dom, now);
  const start = now - ((2 * 3600 + 3 * 60 + 4) * 1000); // 02h 03m 04s ago
  WUI.timer(el, start);
  assert.equal(el.textContent, '02h 03m 04s');
});

test('timer: shows the day segment only when elapsed >= 1 day', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  const now = 1_752_400_000_000;
  freezeNow(dom, now);
  const start = now - ((1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000); // 1d 02h 03m 04s ago
  WUI.timer(el, start);
  assert.equal(el.textContent, '1d 02h 03m 04s');
});

test('timer: zero-pads hours/mins/secs to 2 digits, no padding on the day count', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  const now = 1_752_400_000_000;
  freezeNow(dom, now);
  const start = now - ((12 * 86400 + 1 * 3600 + 2 * 60 + 3) * 1000); // 12d 01h 02m 03s ago
  WUI.timer(el, start);
  assert.equal(el.textContent, '12d 01h 02m 03s');
});

test('timer: reads the start timestamp off data-wui-elapsed (ISO string) when startTs omitted', (t) => {
  const dom = load('<span id="t" data-wui-elapsed=""></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  const now = 1_752_400_000_000;
  const startIso = new Date(now - 5 * 1000).toISOString(); // 5s ago, built with the real Date
  el.setAttribute('data-wui-elapsed', startIso);
  freezeNow(dom, now);
  WUI.timer(el);
  assert.equal(el.textContent, '00h 00m 05s');
});

test('timer: accepts a numeric string (epoch ms as text) off the attribute', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  const now = 1_752_400_000_000;
  el.setAttribute('data-wui-elapsed', String(now - 90 * 1000)); // 1m 30s ago, as text
  freezeNow(dom, now);
  WUI.timer(el);
  assert.equal(el.textContent, '00h 01m 30s');
});

test('timer: repeat calls are idempotent — no leaked intervals, re-render is consistent', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el)); // clears the FINAL handle after the two starts
  const now = 1_752_400_000_000;
  freezeNow(dom, now);
  const start = now - 4000; // 4s ago
  WUI.timer(el, start);
  const first = el.__wuiTimer.interval;
  assert.equal(el.textContent, '00h 00m 04s');
  WUI.timer(el, start); // second call must clear the prior interval, not stack another
  const second = el.__wuiTimer.interval;
  assert.notEqual(first, second, 'a fresh interval handle replaces the old one');
  assert.equal(el.textContent, '00h 00m 04s');
});

test('timer: initTimer boot-scans [data-wui-elapsed] on load', (t) => {
  const start = new Date(Date.now() - 61 * 1000); // 1m 01s ago (real clock — boot runs at load time)
  const dom = load('<span id="t" data-wui-elapsed="' + start.toISOString() + '"></span>');
  const { document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el)); // boot started a ticker on this element too
  assert.equal(el.textContent, '00h 01m 01s');
});

test('timer: localized unit letters after WUI.i18n.register + setLang("ar")', (t) => {
  const dom = load('<span id="t"></span>');
  const { WUI, document } = dom.window;
  const el = document.getElementById('t');
  t.after(() => stopTimer(dom, el));
  WUI.i18n.register([
    { lang: 'ar', id: 'TimerDay', value: 'ي' },
    { lang: 'ar', id: 'TimerHour', value: 'س' },
    { lang: 'ar', id: 'TimerMin', value: 'د' },
    { lang: 'ar', id: 'TimerSec', value: 'ث' }
  ]);
  const now = 1_752_400_000_000;
  freezeNow(dom, now);
  const start = now - ((1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000);
  WUI.timer(el, start);
  assert.equal(el.textContent, '1d 02h 03m 04s'); // default en letters
  WUI.i18n.setLang('ar');
  WUI.timer(el, start); // idempotent restart re-renders immediately in the new language
  assert.equal(el.textContent, '1ي 02س 03د 04ث');
});

test('timer: the ticker clears its own interval once the element is detached', () => {
  const dom = load('<span id="t"></span>');
  const { WUI, document, window } = dom.window;
  const el = document.getElementById('t');

  let capturedTick = null;
  let clearedId = null;
  const fakeId = 12345;
  const origSetInterval = window.setInterval;
  const origClearInterval = window.clearInterval;
  window.setInterval = (fn) => { capturedTick = fn; return fakeId; };
  window.clearInterval = (id) => { clearedId = id; };

  WUI.timer(el, Date.now() - 1000);
  assert.ok(capturedTick, 'setInterval was scheduled');

  el.remove(); // detach before the next tick fires
  capturedTick(); // simulate that next tick
  assert.equal(clearedId, fakeId, 'tick() clears its own interval once document.contains(el) is false');

  window.setInterval = origSetInterval;
  window.clearInterval = origClearInterval;
});
