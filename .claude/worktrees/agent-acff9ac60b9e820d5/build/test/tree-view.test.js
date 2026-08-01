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

const TREE = '<div data-wui-tree="true" role="tree" id="t">' +
  '<div class="wui-tree-node" data-wui-tree-node="true" role="treeitem" id="n1" data-value="A">' +
  '<div class="wui-tree-node-row"><span class="wui-tree-node-toggle" data-wui-tree-toggle="true"><span id="chev1" class="material-symbols-outlined wui-tree-chevron">chevron_right</span></span>' +
  '<span class="wui-tree-node-content">A</span></div>' +
  '<div class="wui-tree-children" role="group">' +
    '<div class="wui-tree-node" data-wui-tree-node="true" role="treeitem" id="n1a" data-value="A|1">' +
    '<div class="wui-tree-node-row"><button id="act" type="button">x</button><span class="wui-tree-node-content">A-1</span></div>' +
    '</div>' +
  '</div></div>' +
  '<div class="wui-tree-node" data-wui-tree-node="true" role="treeitem" id="n2" data-value="B">' +
  '<div class="wui-tree-node-row"><span class="wui-tree-node-content">B</span></div>' +
  '</div></div>';

test('tree-view: toggle click flips is-open + aria-expanded, fires wui:treetoggle', () => {
  const dom = load(TREE);
  const { document } = dom.window;
  const node = document.getElementById('n1');
  let evt = null;
  document.addEventListener('wui:treetoggle', (e) => { evt = e; });
  document.getElementById('chev1').click();
  assert.equal(node.classList.contains('is-open'), true);
  assert.equal(node.getAttribute('aria-expanded'), 'true');
  assert.ok(evt, 'wui:treetoggle fired');
  assert.equal(evt.detail.node, node);
  assert.equal(evt.detail.open, true);
  document.getElementById('chev1').click();
  assert.equal(node.classList.contains('is-open'), false);
  assert.equal(node.getAttribute('aria-expanded'), 'false');
});

test('tree-view: toggle click does not also select', () => {
  const dom = load(TREE);
  const { document } = dom.window;
  document.getElementById('chev1').click();
  assert.equal(document.getElementById('n1').classList.contains('is-selected'), false);
});

test('tree-view: row click selects, scoped to the tree, fires wui:treeselect with value', () => {
  const dom = load(TREE);
  const { document } = dom.window;
  let evt = null;
  document.addEventListener('wui:treeselect', (e) => { evt = e; });
  document.getElementById('n1a').querySelector('.wui-tree-node-content').click();
  assert.equal(document.getElementById('n1a').classList.contains('is-selected'), true);
  assert.equal(document.getElementById('n1a').getAttribute('aria-selected'), 'true');
  assert.ok(evt, 'wui:treeselect fired');
  assert.equal(evt.detail.value, 'A|1');

  // selecting a second node clears the first (single-select, WUI.selectOne)
  document.getElementById('n2').querySelector('.wui-tree-node-content').click();
  assert.equal(document.getElementById('n2').classList.contains('is-selected'), true);
  assert.equal(document.getElementById('n1a').classList.contains('is-selected'), false);
  assert.equal(document.getElementById('n1a').getAttribute('aria-selected'), 'false');
});

test('tree-view: click on an INTERACTIVE control inside a row does not select', () => {
  const dom = load(TREE);
  const { document } = dom.window;
  document.getElementById('act').click();
  assert.equal(document.getElementById('n1a').classList.contains('is-selected'), false);
});
