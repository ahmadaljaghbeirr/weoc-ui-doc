import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

const HTML = `
  <form id="f" data-wui-dirty data-wui-dirty-bar="#save-bar" data-wui-dirty-warn>
    <input type="text" name="title" value="Alpha">
    <select name="status">
      <option value="open" selected>Open</option>
      <option value="closed">Closed</option>
    </select>
    <input type="checkbox" name="flag" checked>
  </form>
  <div id="save-bar" hidden>
    <span data-wui-dirty-text></span>
  </div>`;

function load(html) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.eval(readFileSync(BUNDLE, 'utf8'));
  return dom;
}

test('dirty-tracker: initial state is clean, bar hidden', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const form = document.getElementById('f');
  const bar = document.getElementById('save-bar');
  assert.equal(form.classList.contains('is-dirty'), false);
  assert.equal(bar.classList.contains('wui-visible'), false);
  assert.equal(bar.hasAttribute('hidden'), true);
  assert.equal(form.__wuiDirty.isDirty(), false);
});

test('dirty-tracker: editing a field marks dirty, reveals bar, fires onDirtyChange', () => {
  // Build a fresh (non-auto-booted) form + bar via the JS opts API so this
  // instance's onDirtyChange is the only listener in play.
  const dom = load('<div></div>');
  const { document, WUI } = dom.window;
  document.body.innerHTML =
    '<form id="f2"><input type="text" name="title" value="Alpha"></form>' +
    '<div id="save-bar2" hidden><span data-wui-dirty-text></span></div>';
  const form = document.getElementById('f2');
  const bar = document.getElementById('save-bar2');
  const events = [];
  WUI.dirtyTracker(form, { barSelector: '#save-bar2', onDirtyChange: (d) => events.push(d) });

  const title = form.querySelector('[name="title"]');
  title.value = 'Bravo';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  assert.equal(form.classList.contains('is-dirty'), true);
  assert.equal(bar.classList.contains('wui-visible'), true);
  assert.equal(bar.hasAttribute('hidden'), false);
  assert.deepEqual(events, [true]);
  assert.equal(form.__wuiDirty.isDirty(), true);
});

test('dirty-tracker: reverting the value goes clean again', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const form = document.getElementById('f');
  const title = form.querySelector('[name="title"]');

  title.value = 'Bravo';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(form.classList.contains('is-dirty'), true);

  title.value = 'Alpha';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(form.classList.contains('is-dirty'), false);
  assert.equal(document.getElementById('save-bar').hasAttribute('hidden'), true);
});

test('dirty-tracker: select/checkbox changes are tracked via change event', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const form = document.getElementById('f');
  const flag = form.querySelector('[name="flag"]');

  flag.checked = false;
  flag.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(form.classList.contains('is-dirty'), true);

  flag.checked = true;
  flag.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(form.classList.contains('is-dirty'), false);
});

test('dirty-tracker: reset() re-snapshots so the current values become the new baseline', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const form = document.getElementById('f');
  const title = form.querySelector('[name="title"]');

  title.value = 'Bravo';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(form.__wuiDirty.isDirty(), true);

  form.__wuiDirty.reset();
  assert.equal(form.__wuiDirty.isDirty(), false);
  assert.equal(form.classList.contains('is-dirty'), false);
  assert.equal(document.getElementById('save-bar').hasAttribute('hidden'), true);

  // further edits are measured against the NEW baseline ('Bravo'), not 'Alpha'
  title.value = 'Charlie';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(form.__wuiDirty.isDirty(), true);

  title.value = 'Bravo';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(form.__wuiDirty.isDirty(), false);
});

test('dirty-tracker: beforeunload warning is attached only while dirty (data-wui-dirty-warn)', () => {
  const dom = load(HTML);
  const { document } = dom.window;
  const form = document.getElementById('f');
  const title = form.querySelector('[name="title"]');
  let added = 0, removed = 0;
  const origAdd = dom.window.addEventListener.bind(dom.window);
  const origRemove = dom.window.removeEventListener.bind(dom.window);
  dom.window.addEventListener = (t, f, o) => { if (t === 'beforeunload') added++; return origAdd(t, f, o); };
  dom.window.removeEventListener = (t, f, o) => { if (t === 'beforeunload') removed++; return origRemove(t, f, o); };

  title.value = 'Bravo';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(added, 1);

  title.value = 'Alpha';
  title.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(removed, 1);
});

test('dirty-tracker: save-bar label is localized via WUI.i18n (UnsavedChanges)', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'UnsavedChanges', value: 'You have unsaved changes.' },
    { lang: 'ar', id: 'UnsavedChanges', value: 'لديك تغييرات غير محفوظة.' }
  ]);
  WUI.i18n.apply(document);
  const textEl = document.querySelector('[data-wui-dirty-text]');
  assert.equal(textEl.getAttribute('data-wui-i18n'), 'UnsavedChanges');
  assert.equal(textEl.textContent, 'You have unsaved changes.');
  WUI.i18n.setLang('ar');
  assert.equal(textEl.textContent, 'لديك تغييرات غير محفوظة.');
});

test('dirty-tracker: dirtyTracker() is idempotent per form (no duplicate listeners)', () => {
  const dom = load(HTML);
  const { WUI, document } = dom.window;
  const form = document.getElementById('f');
  let n = 0;
  const orig = form.addEventListener.bind(form);
  form.addEventListener = (t, f, o) => { if (t === 'input') n++; return orig(t, f, o); };
  const api1 = WUI.dirtyTracker(form);
  const api2 = WUI.dirtyTracker(form);
  assert.equal(n, 0, 'boot already ran on load(); a second call must not attach another input listener');
  assert.equal(api1, api2, 'idempotent call returns the SAME api object');
});
