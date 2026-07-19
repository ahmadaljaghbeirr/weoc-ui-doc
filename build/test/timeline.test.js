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

test('timeline: create() returns null for a missing element, is idempotent per element', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  assert.equal(WUI.timeline.create('#nope', {}), null);
  const a = WUI.timeline.create('#list', {});
  const b = WUI.timeline.create('#list', {});
  assert.equal(a, b);
});

test('timeline: render() builds node/header/body/footer, skips falsy sections', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', {
    node: (e) => ({ icon: 'edit_note', variant: e.variant }),
    header: (e) => '<span class="wui-badge primary">' + e.action + '</span>',
    body: (e) => '<div class="wui-plane color-60">' + e.text + '</div>',
    footer: (e) => e.detail || null
  });

  feed.render([
    { action: 'Created', text: 'first', variant: 'success', detail: 'extra detail' },
    { action: 'Updated', text: 'second', variant: 'warning', detail: '' }
  ]);

  const items = document.querySelectorAll('.wui-timeline-item');
  assert.equal(items.length, 2);

  const first = items[0];
  assert.equal(first.querySelector('.wui-icon-bubble.solid.success .material-symbols-outlined').textContent, 'edit_note');
  assert.equal(first.querySelector('.wui-timeline-hdr .wui-badge').textContent, 'Created');
  assert.equal(first.querySelector('.wui-timeline-body .wui-plane').textContent, 'first');
  assert.equal(first.querySelector('.wui-timeline-footer').textContent, 'extra detail');
  assert.equal(first.classList.contains('is-last'), false);

  const second = items[1];
  // footer callback returned '' (falsy) -> no .wui-timeline-footer node at all
  assert.equal(second.querySelector('.wui-timeline-footer'), null);
  assert.equal(second.classList.contains('is-last'), true);
});

test('timeline: node() accepts a raw HTML string (custom node shape, e.g. numbered circle)', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', {
    node: () => '<span class="wui-badge solid tier-2">1</span>',
    body: (e) => e.text
  });
  feed.render([{ text: 'x' }]);
  const nodeWrap = document.querySelector('.wui-timeline-node-wrap');
  assert.equal(nodeWrap.querySelector('.wui-badge.tier-2').textContent, '1');
});

test('timeline: connector() adds an extra class to .wui-timeline-connector', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', {
    node: () => ({ icon: 'flag' }),
    body: (e) => e.text,
    connector: (e) => 'tier-3'
  });
  feed.render([{ text: 'x' }]);
  const connector = document.querySelector('.wui-timeline-connector');
  assert.equal(connector.classList.contains('tier-3'), true);
});

test('timeline: connector() accepts {class, style} for a runtime-colored dotted rail', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', {
    node: () => ({ icon: 'flag' }),
    body: (e) => e.text,
    connector: (e) => ({ class: 'tier-accent dotted', style: { '--tier-color': e.color } })
  });
  feed.render([{ text: 'x', color: '#ff8800' }]);
  const connector = document.querySelector('.wui-timeline-connector');
  assert.equal(connector.classList.contains('tier-accent'), true);
  assert.equal(connector.classList.contains('dotted'), true);
  assert.equal(connector.style.getPropertyValue('--tier-color'), '#ff8800');
});

test('timeline: empty array renders the emptyTemplate, non-empty replaces it', () => {
  const dom = load('<div id="list"></div><template id="tpl-empty"><div class="wui-timeline-empty">none</div></template>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', {
    body: (e) => e.text,
    emptyTemplate: '#tpl-empty'
  });
  feed.render([]);
  assert.equal(document.querySelector('#list .wui-timeline-empty').textContent, 'none');

  feed.render([{ text: 'a' }]);
  assert.equal(document.querySelector('#list .wui-timeline-empty'), null);
  assert.equal(document.querySelectorAll('#list .wui-timeline-item').length, 1);
});

test('timeline: prepend()/append() insert one item without a full re-render', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', { body: (e) => e.text });
  feed.render([{ text: 'a' }, { text: 'b' }]);

  feed.prepend({ text: 'first' });
  let bodies = [...document.querySelectorAll('.wui-timeline-body')].map(n => n.textContent);
  assert.deepEqual(bodies, ['first', 'a', 'b']);

  feed.append({ text: 'last' });
  bodies = [...document.querySelectorAll('.wui-timeline-body')].map(n => n.textContent);
  assert.deepEqual(bodies, ['first', 'a', 'b', 'last']);
});

test('timeline: clear() empties the container', () => {
  const dom = load('<div id="list"></div>');
  const { WUI, document } = dom.window;
  const feed = WUI.timeline.create('#list', { body: (e) => e.text });
  feed.render([{ text: 'a' }]);
  feed.clear();
  assert.equal(document.getElementById('list').children.length, 0);
});
