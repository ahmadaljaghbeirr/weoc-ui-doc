import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

// Load the built bundle into a fresh jsdom realm. loader.js ships inside the
// bundle once the integration barrier wires src/index.js; until then this test
// exercises the same logic the throwaway harness verified in isolation.
function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + (html || '') + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

test('busy(true) inserts a full-page .wui-busy-overlay; busy(false) removes it', () => {
  const dom = load();
  const { WUI, document } = dom.window;
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 0);
  WUI.busy(true);
  const ov = document.querySelector('.wui-busy-overlay');
  assert.ok(ov, 'overlay inserted');
  assert.ok(ov.classList.contains('wui-busy-fullpage'), 'full-page variant');
  assert.equal(ov.parentNode, document.body, 'appended to body');
  WUI.busy(false);
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 0, 'overlay removed');
});

test('busy(true) is idempotent — a single full-page overlay', () => {
  const dom = load();
  const { WUI, document } = dom.window;
  WUI.busy(true);
  WUI.busy(true);
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 1);
  WUI.busy(false);
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 0);
});

test('target-scoped busy positions the overlay over the element', () => {
  const dom = load('<section id="panel"></section>');
  const { WUI, document } = dom.window;
  const panel = document.getElementById('panel');
  WUI.busy(true, panel);
  const ov = panel.querySelector('.wui-busy-overlay');
  assert.ok(ov, 'overlay is a child of the target');
  assert.ok(ov.classList.contains('wui-busy-scoped'), 'scoped variant');
  assert.equal(panel.getAttribute('aria-busy'), 'true');
  // establishes a positioning context on a statically-positioned target
  assert.equal(panel.style.position, 'relative');
  // scoped overlay is independent of a full-page one
  assert.equal(document.body.querySelectorAll(':scope > .wui-busy-overlay').length, 0);
  WUI.busy(false, panel);
  assert.equal(panel.querySelectorAll('.wui-busy-overlay').length, 0);
  assert.equal(panel.getAttribute('aria-busy'), null);
});

test('scoped busy is idempotent per target', () => {
  const dom = load('<section id="a"></section><section id="b"></section>');
  const { WUI, document } = dom.window;
  const a = document.getElementById('a');
  const b = document.getElementById('b');
  WUI.busy(true, a);
  WUI.busy(true, a);
  assert.equal(a.querySelectorAll('.wui-busy-overlay').length, 1);
  WUI.busy(true, b);
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 2, 'two independent targets');
  WUI.busy(false, a);
  WUI.busy(false, b);
  assert.equal(document.querySelectorAll('.wui-busy-overlay').length, 0);
});

test('buttonBusy toggles disabled + is-busy and restores', () => {
  const dom = load('<button id="save">Save</button>');
  const { WUI, document } = dom.window;
  const btn = document.getElementById('save');
  assert.equal(btn.disabled, false);
  WUI.buttonBusy(btn, true);
  assert.equal(btn.disabled, true);
  assert.ok(btn.classList.contains('is-busy'));
  assert.equal(btn.getAttribute('aria-busy'), 'true');
  WUI.buttonBusy(btn, false);
  assert.equal(btn.disabled, false, 'disabled restored');
  assert.equal(btn.classList.contains('is-busy'), false);
  assert.equal(btn.getAttribute('aria-busy'), null);
});

test('buttonBusy restores a pre-disabled button to disabled', () => {
  const dom = load('<button id="x" disabled>X</button>');
  const { WUI, document } = dom.window;
  const btn = document.getElementById('x');
  WUI.buttonBusy(btn, true);
  WUI.buttonBusy(btn, false);
  assert.equal(btn.disabled, true, 'was disabled before, stays disabled');
});

test('data-wui-loading form submit shows a full-page overlay', () => {
  const dom = load('<form id="f" data-wui-loading><button type="submit">Go</button></form>');
  const { WUI, document } = dom.window;
  const form = document.getElementById('f');
  // jsdom won't navigate; cancel default so the harness stays put
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(document.querySelectorAll('.wui-busy-overlay.wui-busy-fullpage').length, 1);
});

test('data-wui-loading with a selector scopes the overlay', () => {
  const dom = load('<div id="region"></div><form id="f" data-wui-loading="#region"><button type="submit">Go</button></form>');
  const { WUI, document } = dom.window;
  const form = document.getElementById('f');
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  const region = document.getElementById('region');
  assert.ok(region.querySelector('.wui-busy-overlay.wui-busy-scoped'), 'scoped to #region');
});

test('data-wui-loading button click sets button busy', () => {
  const dom = load('<button id="b" data-wui-loading>Load</button>');
  const { WUI, document } = dom.window;
  const btn = document.getElementById('b');
  btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.ok(btn.classList.contains('is-busy'));
  assert.equal(btn.disabled, true);
});

test('overlay carries the localizable Please-wait label (LoaderPleaseWait)', () => {
  const dom = load();
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'LoaderPleaseWait', value: 'Please wait' },
    { lang: 'ar', id: 'LoaderPleaseWait', value: 'يرجى الانتظار' }
  ]);
  WUI.busy(true);
  const lbl = document.querySelector('.wui-busy-overlay [data-wui-i18n="LoaderPleaseWait"]');
  assert.ok(lbl, 'label element present');
  assert.equal(lbl.textContent, 'Please wait');
  WUI.i18n.setLang('ar');
  assert.equal(lbl.textContent, 'يرجى الانتظار', 'label re-localizes on lang change');
  WUI.busy(false);
});

test('graceful when window.WUILoader and GSAP are absent (no throw, overlay still shows)', () => {
  const dom = load();
  const { WUI, document } = dom.window;
  assert.equal(typeof dom.window.WUILoader, 'undefined', 'no companion script loaded');
  assert.equal(typeof dom.window.gsap, 'undefined', 'no gsap loaded');
  assert.doesNotThrow(() => WUI.busy(true));
  const ov = document.querySelector('.wui-busy-overlay');
  assert.ok(ov, 'overlay shows without the companion / gsap');
  // static CSS fallback spinner present
  assert.ok(ov.querySelector('.wui-busy-spinner'), 'fallback spinner present');
  assert.doesNotThrow(() => WUI.busy(false));
});

test('busy calls WUILoader.mount/unmount when the companion is present', () => {
  const dom = load();
  const { WUI, document } = dom.window;
  const calls = [];
  dom.window.WUILoader = {
    mount: function (ov) { calls.push(['mount', ov]); },
    unmount: function (ov) { calls.push(['unmount', ov]); }
  };
  WUI.busy(true);
  WUI.busy(false);
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], 'mount');
  assert.equal(calls[1][0], 'unmount');
  assert.ok(calls[0][1].classList.contains('wui-busy-overlay'));
});
