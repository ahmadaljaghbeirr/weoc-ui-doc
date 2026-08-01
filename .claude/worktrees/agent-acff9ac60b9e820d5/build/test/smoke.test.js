/*
 * Behavioral no-op gate for the weoc-ui build.
 *
 * Loads the BUILT bundle (build/weoc-ui.js) into a jsdom window and asserts the
 * full public WUI API survived transpilation, plus a few real behaviors. This is
 * the gate we verify against instead of a byte-diff (the bundler reformats
 * output, so byte-equality is impossible — behavior-equality is the contract).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(__dirname, '..', '..', 'JS', 'weoc-ui.js');

function loadWUI() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://localhost/',
    pretendToBeVisual: true, // provides requestAnimationFrame
    runScripts: 'outside-only',
  });
  const code = readFileSync(BUNDLE, 'utf8');
  dom.window.eval(code); // the IIFE attaches window.WUI
  return dom;
}

const PUBLIC_API = [
  'getTheme', 'setTheme', 'toggleTheme', 'applyTinyMCETheme', 'syncTinyMCETheme',
  'ready', 'debounce', 'throttle', 'afterTransition', 'lockScroll', 'unlockScroll',
  'setVariant', 'selectOne', 'anchor',
  'open', 'close', 'toggle', 'activate', 'showView',
  'observeSection', 'refreshSection', 'initStickyHeaders',
  'toast', 'snackbar', 'dismissToast', 'dismissToasts',
];

test('WUI namespace is created', () => {
  const dom = loadWUI();
  assert.equal(typeof dom.window.WUI, 'object');
  assert.equal(typeof dom.window.WUI.version, 'string');
});

test('every public API method is a function', () => {
  const { WUI } = loadWUI().window;
  const missing = PUBLIC_API.filter((name) => typeof WUI[name] !== 'function');
  assert.deepEqual(missing, [], `missing/non-function API: ${missing.join(', ')}`);
});

test('theme: setTheme + toggleTheme drive <html data-theme>', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  WUI.setTheme('dark');
  assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(WUI.getTheme(), 'dark');
  WUI.toggleTheme();
  assert.equal(document.documentElement.getAttribute('data-theme'), 'light');
});

test('theme auto-applied on load (data-theme set synchronously)', () => {
  const { document } = loadWUI().window;
  const t = document.documentElement.getAttribute('data-theme');
  assert.ok(t === 'light' || t === 'dark', `expected a theme, got ${t}`);
});

test('utilities: debounce returns a callable', () => {
  const { WUI } = loadWUI().window;
  let hits = 0;
  const fn = WUI.debounce(() => { hits += 1; }, 10);
  assert.equal(typeof fn, 'function');
  fn(); fn(); // trailing debounce — no throw
});

test('toast: creates, returns a handle, mounts to DOM, dismisses', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  const handle = WUI.toast('hello', { duration: 0 });
  assert.ok(handle && handle.el, 'toast returned a handle with an element');
  assert.ok(document.body.contains(handle.el), 'toast mounted in the DOM');
  assert.equal(typeof handle.dismiss, 'function');
  handle.dismiss(); // no throw
});
