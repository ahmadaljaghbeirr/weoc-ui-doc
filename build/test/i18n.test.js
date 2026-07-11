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

test('i18n: register + t lookup + fallback', () => {
  const dom = loadWUI();
  const { WUI } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'T_Hi', value: 'Hi' },
    { lang: 'ar', id: 'T_Hi', value: 'مرحبا' }
  ]);
  assert.equal(WUI.i18n.t('T_Hi'), 'Hi');
  assert.equal(WUI.i18n.tFor('ar', 'T_Hi'), 'مرحبا');
  assert.equal(WUI.i18n.t('T_Missing', 'fb'), 'fb');
  assert.equal(WUI.i18n.t('T_Missing'), 'T_Missing');
});

test('i18n: boot applies default lang/dir on load', () => {
  const dom = loadWUI();
  const { document } = dom.window;
  assert.equal(document.documentElement.getAttribute('lang'), 'en');
  assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
});

test('i18n: setLang drives <html lang/dir>, persists, toggles', () => {
  const dom = loadWUI();
  const { WUI, document, localStorage } = dom.window;
  WUI.i18n.setLang('ar');
  assert.equal(document.documentElement.getAttribute('lang'), 'ar');
  assert.equal(document.documentElement.getAttribute('dir'), 'rtl');
  assert.equal(localStorage.getItem('wui-lang'), 'ar');
  WUI.i18n.toggleLang();
  assert.equal(WUI.i18n.getLang(), 'en');
  assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
});

test('i18n: wui:langchange fires with detail', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  var got = null;
  document.documentElement.addEventListener('wui:langchange', function (e) { got = e.detail; });
  WUI.i18n.setLang('ar');
  assert.ok(got && got.lang === 'ar' && got.rtl === true);
});

test('i18n: apply localizes data-wui-i18n and re-renders on setLang', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'T_Save', value: 'Save' },
    { lang: 'ar', id: 'T_Save', value: 'حفظ' }
  ]);
  const el = document.createElement('span');
  el.setAttribute('data-wui-i18n', 'T_Save');
  el.textContent = 'Save';
  document.body.appendChild(el);
  WUI.i18n.apply(document);
  assert.equal(el.textContent, 'Save');
  WUI.i18n.setLang('ar');
  assert.equal(el.textContent, 'حفظ');
  WUI.i18n.setLang('en');
  assert.equal(el.textContent, 'Save');
});

test('i18n: mark sets attribute + text', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  WUI.i18n.register([{ lang: 'en', id: 'T_X', value: 'Ex' }, { lang: 'ar', id: 'T_X', value: 'مثال' }]);
  const a = document.createElement('span');
  WUI.i18n.mark(a, 'T_X');
  document.body.appendChild(a);
  assert.equal(a.getAttribute('data-wui-i18n'), 'T_X');
  assert.equal(a.textContent, 'Ex');
});

test('i18n: data-wui-i18n-html sets innerHTML (preserves inline markup)', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  WUI.i18n.register([
    { lang: 'en', id: 'T_H', value: 'Use <code>apply()</code> now' },
    { lang: 'ar', id: 'T_H', value: 'استخدم <code>apply()</code> الآن' }
  ]);
  const p = document.createElement('p');
  p.setAttribute('data-wui-i18n-html', 'T_H');
  document.body.appendChild(p);
  WUI.i18n.apply(document);
  assert.equal(p.innerHTML, 'Use <code>apply()</code> now');
  assert.equal(p.querySelector('code').textContent, 'apply()');
  WUI.i18n.setLang('ar');
  assert.equal(p.innerHTML, 'استخدم <code>apply()</code> الآن');
  assert.ok(p.querySelector('code'));
});

test('i18n: legacy <resource> resolves via apply', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  WUI.i18n.register([{ lang: 'en', id: 'T_R', value: 'En' }, { lang: 'ar', id: 'T_R', value: 'عر' }]);
  const r = document.createElement('resource');
  r.id = 'T_R';
  r.textContent = 'En';
  document.body.appendChild(r);
  WUI.i18n.setLang('ar');
  assert.equal(r.innerHTML, 'عر');
});

test('i18n: data-wui-lang-toggle flips language on click', () => {
  const dom = loadWUI();
  const { WUI, document } = dom.window;
  const btn = document.createElement('button');
  btn.setAttribute('data-wui-lang-toggle', '');
  document.body.appendChild(btn);
  assert.equal(WUI.i18n.getLang(), 'en');
  btn.click();
  assert.equal(WUI.i18n.getLang(), 'ar');
});

test('i18n: getResource + splitCurrentLang shims', () => {
  const dom = loadWUI();
  const { WUI, window } = dom.window;
  WUI.i18n.register([{ lang: 'en', id: 'T_S', value: 'Sv' }, { lang: 'ar', id: 'T_S', value: 'سف' }]);
  assert.equal(window.getResource('T_S'), 'Sv');
  assert.equal(window.splitCurrentLang('EN - AR'), 'EN');
  WUI.i18n.setLang('ar');
  assert.equal(window.getResource('T_S'), 'سف');
  assert.equal(window.splitCurrentLang('EN - AR'), 'AR');
});
