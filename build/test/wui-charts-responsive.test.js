import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');
const CHARTS = join(__dirname, '..', '..', 'JS', 'wui-charts.js');

function stubCanvasContext(window) {
  var noop = function () { return undefined; };
  var fakeCtx = {
    save: noop, restore: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, arc: noop, ellipse: noop,
    quadraticCurveTo: noop, bezierCurveTo: noop, rect: noop, clip: noop,
    fill: noop, stroke: noop, clearRect: noop, fillRect: noop,
    scale: noop, translate: noop, rotate: noop, setTransform: noop,
    setLineDash: noop, measureText: function () { return { width: 0 }; },
    createLinearGradient: function () { return { addColorStop: noop }; },
    fillText: noop, strokeText: noop
  };
  window.HTMLCanvasElement.prototype.getContext = function () { return fakeCtx; };
}

function setRect(el, w, h) {
  el.getBoundingClientRect = function () {
    return { width: w, height: h, top: 0, left: 0, right: w, bottom: h, x: 0, y: 0, toJSON: function () {} };
  };
  Object.defineProperty(el, 'offsetWidth', { value: w, configurable: true });
  Object.defineProperty(el, 'offsetHeight', { value: h, configurable: true });
}

function loadWithCharts() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  stubCanvasContext(dom.window);
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  dom.window.eval(readFileSync(CHARTS, 'utf8'));
  return dom;
}

test('gauge: resizing the container updates the canvas backing-store width', async () => {
  const dom = loadWithCharts();
  const { WUI, document, window } = dom.window;
  const host = document.createElement('div');
  document.body.appendChild(host);
  setRect(host, 220, 140);

  const handle = WUI.gauge(host, { value: 55 });
  const canvas = host.querySelector('canvas');
  assert.ok(canvas, 'gauge creates a canvas');
  const dpr = window.devicePixelRatio || 1;
  assert.equal(canvas.width, Math.round(220 * dpr));

  setRect(host, 440, 140);
  window.dispatchEvent(new window.Event('resize'));
  await new Promise(function (resolve) { setTimeout(resolve, 150); });

  assert.equal(canvas.width, Math.round(440 * dpr), 'canvas backing store tracks the new container width');

  handle.destroy();
});

test('pie: destroy() disconnects the resize observer (no error on a later resize)', async () => {
  const dom = loadWithCharts();
  const { WUI, document, window } = dom.window;
  const host = document.createElement('div');
  document.body.appendChild(host);
  setRect(host, 320, 240);

  const handle = WUI.pie(host, { data: [{ label: 'A', value: 1, color: 'primary' }] });
  handle.destroy();

  setRect(host, 500, 240);
  assert.doesNotThrow(function () {
    window.dispatchEvent(new window.Event('resize'));
  });
});

test('gauge: devicePixelRatio backing store — canvas.width is CSS-width * dpr, not 1:1', async () => {
  const dom = loadWithCharts();
  dom.window.devicePixelRatio = 2;
  const { WUI, document } = dom.window;
  const host = document.createElement('div');
  document.body.appendChild(host);
  setRect(host, 220, 140);

  const handle = WUI.gauge(host, { value: 10 });
  const canvas = host.querySelector('canvas');
  assert.equal(canvas.width, 440, 'backing store is 2x CSS width at dpr=2');
  assert.equal(canvas.style.width, '220px');

  handle.destroy();
});
