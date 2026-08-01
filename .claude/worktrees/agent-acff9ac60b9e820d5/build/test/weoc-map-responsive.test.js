import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');
const MAPJS  = join(__dirname, '..', '..', 'JS', 'weoc-map.js');

function loadWithMap() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  dom.window.eval(readFileSync(MAPJS, 'utf8'));
  return dom;
}

test('WeocMap.create observes the view container for resize, disconnects on destroy', () => {
  const dom = loadWithMap();
  const { WUI, WeocMap, document } = dom.window;

  const observed = [];
  const disconnectCalls = [];
  WUI.responsive.observe = function (el, onResize, opts) {
    observed.push({ el: el, opts: opts });
    return { disconnect: function () { disconnectCalls.push(el); } };
  };

  const root = document.createElement('div');
  root.setAttribute('data-wui-map', '');
  document.body.appendChild(root);

  const inst = WeocMap.create(root, { mode: 'display' });
  assert.ok(inst, 'instance created even without ArcGIS require() present');
  assert.equal(observed.length, 1, 'observe() called exactly once during construction');
  assert.equal(observed[0].el, inst._viewDiv, 'observes the resolved view container, not the outer root');

  inst.destroy();
  assert.equal(disconnectCalls.length, 1, 'destroy() disconnects the observer');
  assert.equal(disconnectCalls[0], inst._viewDiv);
});

test('resize callback calls the map instance resize() method, guarded when view is not ready', () => {
  const dom = loadWithMap();
  const { WUI, WeocMap, document } = dom.window;

  var capturedCb = null;
  WUI.responsive.observe = function (el, onResize) {
    capturedCb = onResize;
    return { disconnect: function () {} };
  };

  const root = document.createElement('div');
  document.body.appendChild(root);
  const inst = WeocMap.create(root, { mode: 'display' });

  var resizeCalls = 0;
  inst.resize = function () { resizeCalls += 1; return this; };

  assert.equal(typeof capturedCb, 'function');
  capturedCb({ tooSmall: false, width: 400, height: 300 });
  assert.equal(resizeCalls, 1, 'resize callback delegates to inst.resize()');

  capturedCb({ tooSmall: true, width: 5, height: 5 });
  assert.equal(resizeCalls, 1, 'tooSmall resize events are ignored, not forwarded to resize()');
});
