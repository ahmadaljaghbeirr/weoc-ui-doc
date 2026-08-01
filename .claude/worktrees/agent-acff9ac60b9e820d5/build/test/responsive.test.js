import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

function loadWUI() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

function setRect(el, w, h) {
  el.getBoundingClientRect = function () {
    return { width: w, height: h, top: 0, left: 0, right: w, bottom: h, x: 0, y: 0, toJSON: function () {} };
  };
}

test('responsive: fallback path (jsdom has no ResizeObserver) coalesces a burst into one call', async () => {
  const dom = loadWUI();
  const { WUI, document, window } = dom.window;
  assert.equal(typeof window.ResizeObserver, 'undefined', 'jsdom has no ResizeObserver — exercises the fallback branch');

  const el = document.createElement('div');
  document.body.appendChild(el);
  setRect(el, 300, 150);

  const calls = [];
  const handle = WUI.responsive.observe(el, function (info) { calls.push(info); });

  setRect(el, 400, 200);
  window.dispatchEvent(new window.Event('resize'));
  window.dispatchEvent(new window.Event('resize'));

  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  assert.equal(calls.length, 1, 'two resize events in one burst coalesce to a single onResize call');
  assert.equal(calls[0].width, 400);
  assert.equal(calls[0].height, 200);
  assert.equal(calls[0].tooSmall, false);

  handle.disconnect();
});

test('responsive: reports tooSmall below minWidth/minHeight', async () => {
  const dom = loadWUI();
  const { WUI, document, window } = dom.window;
  const el = document.createElement('div');
  document.body.appendChild(el);
  setRect(el, 10, 10);

  const calls = [];
  const handle = WUI.responsive.observe(el, function (info) { calls.push(info); }, { minWidth: 20, minHeight: 20 });

  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].tooSmall, true);

  handle.disconnect();
});

test('responsive: skip-if-unchanged — identical rounded dims do not re-fire', async () => {
  const dom = loadWUI();
  const { WUI, document, window } = dom.window;
  const el = document.createElement('div');
  document.body.appendChild(el);
  setRect(el, 300.4, 150.2); // rounds to 300x150

  const calls = [];
  const handle = WUI.responsive.observe(el, function (info) { calls.push(info); });

  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  setRect(el, 300.1, 149.6); // also rounds to 300x150 — no real change
  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  assert.equal(calls.length, 1, 'second resize rounds to the same dims, so no second call');

  handle.disconnect();
});

test('responsive: disconnect() stops further onResize calls', async () => {
  const dom = loadWUI();
  const { WUI, document, window } = dom.window;
  const el = document.createElement('div');
  document.body.appendChild(el);
  setRect(el, 300, 150);

  const calls = [];
  const handle = WUI.responsive.observe(el, function (info) { calls.push(info); });
  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });
  assert.equal(calls.length, 1);

  handle.disconnect();
  setRect(el, 500, 250);
  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  assert.equal(calls.length, 1, 'no new call after disconnect');
});
