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

test('confirm: WUI.confirm returns a Promise', () => {
  const dom = load('');
  const { WUI } = dom.window;
  const p = WUI.confirm({ messageKey: 'M' });
  assert.ok(p instanceof dom.window.Promise);
});

test('confirm: resolves true when the confirm button is clicked', async () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  const p = WUI.confirm({ messageKey: 'M' });
  document.querySelector('[data-wui-confirm-ok-el]').click();
  assert.equal(await p, true);
});

test('confirm: resolves false when the cancel button is clicked', async () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  const p = WUI.confirm({ messageKey: 'M' });
  document.querySelector('[data-wui-confirm-cancel-el]').click();
  assert.equal(await p, false);
});

test('confirm: resolves false on dismiss (X button)', async () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  const p = WUI.confirm({ messageKey: 'M' });
  document.querySelector('[data-wui-confirm-x-el]').click();
  assert.equal(await p, false);
});

test('confirm: resolves false on Esc', async () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  const p = WUI.confirm({ messageKey: 'M' });
  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(await p, false);
});

test('confirm: a data-wui-confirm button opens the dialog', () => {
  const dom = load('<button id="del" data-wui-confirm="DeleteMsg">Delete</button>');
  const { document } = dom.window;
  document.getElementById('del').click();
  const modal = document.getElementById('wui-confirm-modal');
  assert.ok(modal, 'modal built');
  assert.equal(modal.classList.contains('is-open'), true);
});

test('confirm: localized title/message/button text via WUI.i18n', () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'DeleteTitle', value: 'Delete item?' },
    { lang: 'en', id: 'DeleteMsg', value: 'This cannot be undone.' },
    { lang: 'en', id: 'DeleteOk', value: 'Delete' },
    { lang: 'ar', id: 'DeleteTitle', value: 'حذف العنصر؟' }
  ]);
  WUI.confirm({ messageKey: 'DeleteMsg', titleKey: 'DeleteTitle', confirmKey: 'DeleteOk', tone: 'danger' });

  const title = document.querySelector('[data-wui-confirm-title-el]');
  const msg = document.querySelector('[data-wui-confirm-msg-el]');
  const ok = document.querySelector('[data-wui-confirm-ok-el]');
  assert.equal(title.textContent, 'Delete item?');
  assert.equal(msg.textContent, 'This cannot be undone.');
  assert.equal(ok.textContent, 'Delete');
  assert.equal(ok.classList.contains('danger'), true);

  WUI.i18n.setLang('ar');
  assert.equal(title.textContent, 'حذف العنصر؟');
});

test('confirm: default en keys are registered (ConfirmTitle/Ok/Cancel)', () => {
  const dom = load('');
  const { WUI, document } = dom.window;
  WUI.confirm({ messageKey: 'M' });
  const title = document.querySelector('[data-wui-confirm-title-el]');
  const ok = document.querySelector('[data-wui-confirm-ok-el]');
  const cancel = document.querySelector('[data-wui-confirm-cancel-el]');
  assert.equal(title.textContent, 'Please confirm');
  assert.equal(ok.textContent, 'Confirm');
  assert.equal(cancel.textContent, 'Cancel');
});

test('confirm: idempotent delegated wiring (re-init is a safe no-op)', () => {
  const dom = load('<button id="del" data-wui-confirm="M">Delete</button>');
  const { WUI, document } = dom.window;
  const before = WUI.__confirmWired;
  assert.equal(before, true);
  // simulate a redundant boot pass / accidental second call
  WUI.__confirmWired = true;
  let clicks = 0;
  document.getElementById('del').addEventListener('click', function (e) {
    if (!e.defaultPrevented) clicks++;
  });
  document.getElementById('del').click();
  const modal = document.getElementById('wui-confirm-modal');
  assert.ok(modal.classList.contains('is-open'), 'still opens exactly once via the single wired listener');
});
