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

// Static panels (no updatesection authored) must NOT gain updatesection.
test('showView: static views are pure show/hide, no updatesection injected', () => {
  const dom = load(
    '<div data-wui-view-group="g" data-wui-view="a" id="a"></div>' +
    '<div data-wui-view-group="g" data-wui-view="b" id="b" style="display:none"></div>');
  const { WUI, document } = dom.window;
  WUI.showView('g', 'b');
  const a = document.getElementById('a'), b = document.getElementById('b');
  assert.equal(a.style.display, 'none');
  assert.equal(b.style.display, '');
  assert.equal(a.hasAttribute('updatesection'), false);
  assert.equal(b.hasAttribute('updatesection'), false);
});

// Records-screen regression: views that AUTHORED updatesection keep the move.
test('showView: participant views (authored updatesection) still shuffle it', () => {
  const dom = load(
    '<div data-wui-view-group="r" data-wui-view="cards" id="cards" updatesection="true"></div>' +
    '<div data-wui-view-group="r" data-wui-view="table" id="table" updatesection="true" style="display:none"></div>');
  const { WUI, document } = dom.window;
  WUI.showView('r', 'table');
  const cards = document.getElementById('cards'), table = document.getElementById('table');
  assert.equal(table.getAttribute('updatesection'), 'true');
  assert.equal(cards.hasAttribute('updatesection'), false);
  // switch back — participant flag must persist (not lost after removal)
  WUI.showView('r', 'cards');
  assert.equal(cards.getAttribute('updatesection'), 'true');
  assert.equal(table.hasAttribute('updatesection'), false);
});

// .wui-tab-panel's own CSS defaults to display:none and only .active overrides
// to display:block — showView must toggle that class too, or the shown panel
// (inline style cleared to '') stays hidden under the real stylesheet cascade.
test('showView: toggles .active alongside inline display (wui-tab-panel compat)', () => {
  const dom = load(
    '<div data-wui-view-group="t" data-wui-view="one" id="one" class="active"></div>' +
    '<div data-wui-view-group="t" data-wui-view="two" id="two"></div>');
  const { WUI, document } = dom.window;
  const one = document.getElementById('one'), two = document.getElementById('two');

  WUI.showView('t', 'two');
  assert.equal(two.classList.contains('active'), true);
  assert.equal(one.classList.contains('active'), false);

  WUI.showView('t', 'one');
  assert.equal(one.classList.contains('active'), true);
  assert.equal(two.classList.contains('active'), false);
});
