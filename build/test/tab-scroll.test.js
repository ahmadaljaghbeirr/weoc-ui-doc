import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}
// force overflow geometry jsdom won't compute
function stub(el, { scrollWidth = 0, clientWidth = 0, scrollLeft = 0 }) {
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true });
  let sl = scrollLeft;
  Object.defineProperty(el, 'scrollLeft', { get: () => sl, set: v => { sl = v; }, configurable: true });
}

test('tab-scroll: auto-injects wrap + two arrows once (idempotent)', () => {
  const dom = load('<div class="wui-hdr-tabs" id="s" data-wui-tab-scroll></div>');
  const { WUI, document } = dom.window;
  const strip = document.getElementById('s');
  // WUI.ready already ran on load; call again to prove idempotency
  WUI.initTabScroll(strip);
  const wrap = strip.closest('.wui-hdr-tabs-wrap');
  assert.ok(wrap, 'wrap created');
  assert.equal(wrap.querySelectorAll('.wui-fab.tabs-scroll-left').length, 1);
  assert.equal(wrap.querySelectorAll('.wui-fab.tabs-scroll-right').length, 1);
});

test('tab-scroll: aria-labels localized + flip on langchange', () => {
  const dom = load('<div class="wui-hdr-tabs" id="s" data-wui-tab-scroll></div>');
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'ScrollTabsLeft', value: 'Scroll tabs left' },
    { lang: 'ar', id: 'ScrollTabsLeft', value: 'تمرير لليسار' }
  ]);
  const strip = document.getElementById('s');
  WUI.i18n.apply(document);
  const left = strip.closest('.wui-hdr-tabs-wrap').querySelector('.tabs-scroll-left');
  assert.equal(left.getAttribute('aria-label'), 'Scroll tabs left');
  WUI.i18n.setLang('ar');
  assert.equal(left.getAttribute('aria-label'), 'تمرير لليسار');
});

test('tab-scroll: has-left/has-right reflect scroll position', () => {
  const dom = load('<div class="wui-hdr-tabs" id="s" data-wui-tab-scroll></div>');
  const { WUI, document } = dom.window;
  const strip = document.getElementById('s');
  const wrap = strip.closest('.wui-hdr-tabs-wrap');
  stub(strip, { scrollWidth: 400, clientWidth: 100, scrollLeft: 0 });
  strip.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(wrap.classList.contains('has-left'), false);
  assert.equal(wrap.classList.contains('has-right'), true);
  strip.scrollLeft = 300;
  strip.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(wrap.classList.contains('has-left'), true);
  assert.equal(wrap.classList.contains('has-right'), false);
});

test('tab-scroll: RTL maps physical overflow to the correct edge', () => {
  const dom = load('<div class="wui-hdr-tabs" id="s" data-wui-tab-scroll></div>');
  const { WUI, document } = dom.window;
  document.documentElement.dir = 'rtl';
  const strip = document.getElementById('s');
  const wrap = strip.closest('.wui-hdr-tabs-wrap');
  // modern RTL (negative) convention: start = scrollLeft 0 at the right edge,
  // so ALL overflow content is hidden on the physical LEFT.
  stub(strip, { scrollWidth: 400, clientWidth: 100, scrollLeft: 0 });
  strip.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(wrap.classList.contains('has-left'), true);
  assert.equal(wrap.classList.contains('has-right'), false);
  strip.scrollLeft = -300;               // scrolled fully to the end (left)
  strip.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(wrap.classList.contains('has-left'), false);
  assert.equal(wrap.classList.contains('has-right'), true);
});

test('tab-scroll: arrow click scrolls; wheel scrolls horizontally', () => {
  const dom = load('<div class="wui-hdr-tabs" id="s" data-wui-tab-scroll></div>');
  const { WUI, document } = dom.window;
  const strip = document.getElementById('s');
  stub(strip, { scrollWidth: 400, clientWidth: 100, scrollLeft: 100 });
  let by = null; strip.scrollBy = (o) => { by = o; };
  strip.closest('.wui-hdr-tabs-wrap').querySelector('.tabs-scroll-right').click();
  assert.ok(by && by.left > 0, 'right arrow scrolls positive');
  const before = strip.scrollLeft;
  const ev = new dom.window.Event('wheel'); ev.deltaY = 40;
  strip.dispatchEvent(ev);
  assert.equal(strip.scrollLeft, before + 40);
});
