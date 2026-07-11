// §I18N — EN/AR localization for weoc-ui. Modeled on core/theme.js.
// Kept ES5 (var/function, no arrows/const/let/template-literals) to match
// the WebEOC browser authoring constraint.
import { WUI } from './wui.js';

WUI.i18n = WUI.i18n || {};
WUI.LANG_KEY = 'wui-lang';          // ours — single-key discipline
WUI.LANG_KEY_LEGACY = 'language';   // legacy ResourceManager key, read + migrated once

var registry = { en: {}, ar: {} };

function wuiLSget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function wuiLSset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function wuiNormLang(l) { return l === 'ar' ? 'ar' : 'en'; }

function lookup(lang, id) {
  return (registry[lang] && registry[lang][id] != null) ? registry[lang][id] : null;
}

// --- registry -------------------------------------------------------------
WUI.i18n.register = function (arr) {
  if (!arr || !arr.length) return;
  var i, row, lang;
  for (i = 0; i < arr.length; i++) {
    row = arr[i];
    if (!row || !row.id) continue;
    lang = row.lang;
    if (lang !== 'en' && lang !== 'ar') continue;
    registry[lang][row.id] = row.value;
  }
};

WUI.i18n.tFor = function (lang, id, fallback) {
  var v = lookup(wuiNormLang(lang), id);
  if (v != null) return v;
  return (fallback != null) ? fallback : id;
};

WUI.i18n.t = function (id, fallback) {
  return WUI.i18n.tFor(WUI.i18n.getLang(), id, fallback);
};

// --- language state -------------------------------------------------------
function wuiResolveLang() {
  try {
    if (typeof EnableARLang !== 'undefined' && typeof EnableENLang !== 'undefined') {
      if (EnableARLang === '1' && EnableENLang === '') return 'ar';
      if (EnableENLang === '1' && EnableARLang === '') return 'en';
    }
  } catch (e) {}
  var s = wuiLSget(WUI.LANG_KEY);
  if (s === 'en' || s === 'ar') return s;
  var legacy = wuiLSget(WUI.LANG_KEY_LEGACY);
  if (legacy === 'en' || legacy === 'ar') { wuiLSset(WUI.LANG_KEY, legacy); return legacy; }
  return 'en';
}

WUI.i18n.getLang = function () {
  return document.documentElement.getAttribute('lang') === 'ar' ? 'ar' : 'en';
};

WUI.i18n.setLang = function (lang, opts) {
  lang = wuiNormLang(lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  if (!opts || opts.persist !== false) wuiLSset(WUI.LANG_KEY, lang);
  if (WUI.i18n.apply) WUI.i18n.apply(document);
  document.documentElement.dispatchEvent(new CustomEvent('wui:langchange', {
    bubbles: true, detail: { lang: lang, rtl: lang === 'ar' }
  }));
  return lang;
};

WUI.i18n.toggleLang = function () {
  return WUI.i18n.setLang(WUI.i18n.getLang() === 'ar' ? 'en' : 'ar');
};

// --- reactive DOM pass ----------------------------------------------------
function collect(root, sel) {
  var list = [], i, found;
  if (root.nodeType === 1 && root.matches && root.matches(sel)) list.push(root);
  found = root.querySelectorAll ? root.querySelectorAll(sel) : [];
  for (i = 0; i < found.length; i++) list.push(found[i]);
  return list;
}

function trim(s) { return s.replace(/^\s+|\s+$/g, ''); }

WUI.i18n.apply = function (root) {
  root = root || document;
  var lang = WUI.i18n.getLang();
  var els, i, el, key, val, spec, j, pair, keys;

  // canonical text markers
  els = collect(root, '[data-wui-i18n]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; key = el.getAttribute('data-wui-i18n');
    if (key) el.textContent = WUI.i18n.tFor(lang, key, el.textContent);
  }

  // rich-prose HTML markers: set innerHTML so inline <code>/<a>/icons survive.
  // Values are authored (not user data). Only overwrite when a translation exists.
  els = collect(root, '[data-wui-i18n-html]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; key = el.getAttribute('data-wui-i18n-html');
    if (key) { val = lookup(lang, key); if (val != null) el.innerHTML = val; }
  }

  // legacy element/text targets (only overwrite when a translation exists)
  els = collect(root, 'resource, resoures, .cResource, [l-key]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; key = el.getAttribute('l-key') || el.id;
    if (key) { val = lookup(lang, key); if (val != null) el.innerHTML = val; }
  }

  // attribute markers: data-wui-i18n-attr="placeholder:Key,title:Key2"
  els = collect(root, '[data-wui-i18n-attr]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; spec = el.getAttribute('data-wui-i18n-attr').split(',');
    for (j = 0; j < spec.length; j++) {
      pair = spec[j].split(':');
      if (pair.length === 2) { val = lookup(lang, trim(pair[1])); if (val != null) el.setAttribute(trim(pair[0]), val); }
    }
  }

  // legacy attribute localizer: [isresources=yes][resourcekeys="a,b"]
  els = collect(root, '[isresources="yes"][resourcekeys]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; keys = el.getAttribute('resourcekeys').split(',');
    for (j = 0; j < keys.length; j++) {
      key = trim(keys[j]); val = lookup(lang, key);
      if (val != null) el.setAttribute(key, val);
    }
  }

  // legacy tooltip helpers
  els = collect(root, '.resourceTip[data-resource]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; key = el.getAttribute('data-resource'); val = lookup(lang, key);
    if (val != null) el.setAttribute('title', val);
  }
  els = collect(root, '.tooltip-localization[titleEN][titleAR]');
  for (i = 0; i < els.length; i++) {
    el = els[i]; el.setAttribute('title', lang === 'ar' ? el.getAttribute('titleAR') : el.getAttribute('titleEN'));
  }
};

WUI.i18n.mark = function (el, id) {
  el.setAttribute('data-wui-i18n', id);
  el.textContent = WUI.i18n.t(id, el.textContent);
  return el;
};

// --- synchronous no-FOUC boot --------------------------------------------
(function () {
  var lang = wuiResolveLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
})();

// --- declarative language controls (delegated on document) ----------------
document.addEventListener('click', function (e) {
  var t = e.target;
  if (t.closest && t.closest('[data-wui-lang-toggle]')) { WUI.i18n.toggleLang(); return; }
  var pick = t.closest ? t.closest('[data-wui-lang]') : null;
  if (pick) WUI.i18n.setLang(pick.getAttribute('data-wui-lang'));
});

// --- back-compat shims (legacy boards call these globals) -----------------
window.getResource = function (id, fallback) { return WUI.i18n.t(id, fallback); };
window.changeLang = function () { WUI.i18n.apply(document); };
window.splitCurrentLang = function (val) {
  if (!val) return val;
  var p = String(val).split(' - ');
  if (p.length === 2) return WUI.i18n.getLang() === 'ar' ? p[1] : p[0];
  return val;
};

// --- initial declarative pass once DOM is available -----------------------
function wuiI18nInit() { WUI.i18n.apply(document); }
if (document.readyState !== 'loading') wuiI18nInit();
else document.addEventListener('DOMContentLoaded', wuiI18nInit);
