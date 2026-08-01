import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

const HTML = `
  <button id="btn" class="wui-btn" data-wui-view-mode="g" data-wui-vm-persist="vmk" data-wui-vm-label="View">
    <span class="material-symbols-outlined" data-wui-vm-icon>view_agenda</span>
    <span data-wui-vm-text></span>
  </button>
  <div class="wui-hdr-tabs-wrap"><div class="wui-hdr-tabs" data-wui-segment data-wui-active="active" data-wui-views="g">
    <div class="wui-hdr-tab active" data-wui-value="a">A</div>
    <div class="wui-hdr-tab" data-wui-value="b">B</div>
  </div></div>
  <div class="wui-det-body">
    <div class="wui-tab-panel active" data-wui-view-group="g" data-wui-view="a">A</div>
    <div class="wui-tab-panel" data-wui-view-group="g" data-wui-view="b" style="display:none">B</div>
  </div>`;

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

test('view-mode: click toggles is-list-mode on the container + persists', () => {
  const dom = load(HTML);
  const { document, localStorage } = dom.window;
  const btn = document.getElementById('btn');
  const body = document.querySelector('.wui-det-body');
  btn.click();
  assert.equal(body.classList.contains('is-list-mode'), true);
  assert.equal(localStorage.getItem('vmk'), 'list');
  btn.click();
  assert.equal(body.classList.contains('is-list-mode'), false);
  assert.equal(localStorage.getItem('vmk'), 'tabs');
});

test('view-mode: hides the strip wrap in list mode, restores in tab mode', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const btn = document.getElementById('btn');
  const wrap = document.querySelector('.wui-hdr-tabs-wrap');
  btn.click();
  assert.equal(wrap.style.display, 'none');
  btn.click();
  assert.equal(wrap.style.display, '');
});

test('view-mode: swaps icon + label key to the TARGET mode', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const btn = document.getElementById('btn');
  const icon = btn.querySelector('[data-wui-vm-icon]');
  const text = btn.querySelector('[data-wui-vm-text]');
  assert.equal(icon.textContent, 'view_agenda');
  assert.equal(text.getAttribute('data-wui-i18n'), 'ListView');
  btn.click();
  assert.equal(icon.textContent, 'tab');
  assert.equal(text.getAttribute('data-wui-i18n'), 'TabView');
});

test('view-mode: load applies persisted list mode; absent key = tab mode', () => {
  const dom = load('<div class="wui-det-body"></div>');
  const { WUI, document, localStorage } = dom.window;
  localStorage.setItem('vmk2', 'list');
  const btn = document.createElement('button');
  btn.setAttribute('data-wui-view-mode', 'g2');
  btn.setAttribute('data-wui-vm-persist', 'vmk2');
  btn.innerHTML = '<span data-wui-vm-icon></span><span data-wui-vm-text></span>';
  document.body.appendChild(btn);
  WUI.initViewMode(btn);
  assert.equal(document.querySelector('.wui-det-body').classList.contains('is-list-mode'), true);
});

test('view-mode: return-to-tab re-asserts the active tab via showView', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  let called = null;
  WUI.showView = (g, n) => { called = [g, n]; };
  const btn = document.getElementById('btn');
  btn.click();
  called = null;
  btn.click();
  assert.deepEqual(called, ['g', 'a']);
});

test('view-mode: initViewMode is idempotent per button', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const btn = document.getElementById('btn');
  let n = 0;
  const orig = btn.addEventListener.bind(btn);
  btn.addEventListener = (t, f, o) => { if (t === 'click') n++; return orig(t, f, o); };
  WUI.initViewMode(btn);
  assert.equal(n, 0);
});
