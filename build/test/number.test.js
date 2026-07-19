import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

const HTML = `
  <form id="f">
    <input type="number" id="qty" name="qty" value="3" min="0" max="10" step="1">
    <input type="number" id="skip" name="skip" value="1" data-wui-no-step>
    <div data-wui-no-number>
      <input type="number" id="skip2" name="skip2" value="2">
    </div>
    <input type="text" id="txt" name="txt" value="hello">
  </form>`;

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + (html || '') + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

test('number: wraps a native number input in .wui-number with up/down step buttons', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const input = document.getElementById('qty');
  const wrap = input.parentNode;
  assert.equal(wrap.classList.contains('wui-number'), true);
  const btns = wrap.querySelectorAll('[data-wui-step]');
  assert.equal(btns.length, 2);
  assert.equal(wrap.querySelector('[data-wui-step="up"]') != null, true);
  assert.equal(wrap.querySelector('[data-wui-step="down"]') != null, true);
  // btns live in the aria-hidden container, buttons are tabindex=-1 mouse aids
  assert.equal(wrap.querySelector('.wui-number-btns').getAttribute('aria-hidden'), 'true');
  assert.equal(btns[0].getAttribute('tabindex'), '-1');
});

test('number: preserves the SAME input node — identity, name and value intact', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const input = document.getElementById('qty');
  // still the exact same element the DOM knows by id (not cloned)
  assert.equal(document.getElementById('qty') === input, true);
  assert.equal(input.__wuiNumber, true);
  assert.equal(input.name, 'qty');
  assert.equal(input.value, '3');
  // form still sees it by name — submission is unaffected by the wrapper
  assert.equal(document.getElementById('f').elements['qty'] === input, true);
});

test('number: skips opted-out inputs (data-wui-no-step / ancestor data-wui-no-number)', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const skip = document.getElementById('skip');
  const skip2 = document.getElementById('skip2');
  assert.equal(skip.parentNode.classList.contains('wui-number'), false);
  assert.equal(skip.__wuiNumber, undefined);
  assert.equal(skip2.closest('.wui-number'), null);
  assert.equal(skip2.__wuiNumber, undefined);
});

test('number: leaves non-number inputs alone', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const txt = document.getElementById('txt');
  assert.equal(txt.closest('.wui-number'), null);
});

test('number: idempotent — a second enhance never double-wraps', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const input = document.getElementById('qty');
  const wrap = input.parentNode;
  WUI.enhanceNumbers(document);
  WUI.enhanceNumbers(document);
  // input parent is still the one wrapper; no nested .wui-number
  assert.equal(input.parentNode === wrap, true);
  assert.equal(document.querySelectorAll('.wui-number').length, 1);
  assert.equal(wrap.querySelectorAll('[data-wui-step]').length, 2);
});

test('number: a number input added AFTER boot gets enhanced on re-scan', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const fresh = document.createElement('input');
  fresh.type = 'number';
  fresh.name = 'late';
  fresh.value = '7';
  document.getElementById('f').appendChild(fresh);
  assert.equal(fresh.__wuiNumber, undefined);       // not wrapped yet
  WUI.enhanceNumbers(document);                      // observer path drives this
  assert.equal(fresh.parentNode.classList.contains('wui-number'), true);
  assert.equal(fresh.__wuiNumber, true);
  assert.equal(fresh.value, '7');
});

test('number: the injected step buttons drive the existing stepper handler', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const input = document.getElementById('qty');
  const up = input.parentNode.querySelector('[data-wui-step="up"]');
  const down = input.parentNode.querySelector('[data-wui-step="down"]');
  up.click();
  assert.equal(input.value, '4');   // 3 -> 4 via stepUp (honours step=1)
  down.click();
  assert.equal(input.value, '3');   // 4 -> 3 via stepDown
});

test('number: stepper aria-labels localize via WUI.i18n on setLang(ar)', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const up = document.querySelector('[data-wui-step="up"]');
  const down = document.querySelector('[data-wui-step="down"]');
  // en defaults registered by the module
  assert.equal(up.getAttribute('aria-label'), 'Increase');
  assert.equal(down.getAttribute('aria-label'), 'Decrease');
  // board supplies ar; setLang runs WUI.i18n.apply which honours data-wui-i18n-attr
  WUI.i18n.register([
    { lang: 'ar', id: 'NumberStepUp', value: 'زيادة' },
    { lang: 'ar', id: 'NumberStepDown', value: 'إنقاص' }
  ]);
  WUI.i18n.setLang('ar');
  assert.equal(up.getAttribute('aria-label'), 'زيادة');
  assert.equal(down.getAttribute('aria-label'), 'إنقاص');
});
