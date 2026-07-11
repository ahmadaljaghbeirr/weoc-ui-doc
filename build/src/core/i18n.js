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

// --- cross-frame / cross-tab sync -----------------------------------------
// WebEOC runs board views in nested same-origin iframes. When ANY frame (or a
// toggle injected into the top chrome) changes the persisted language, every
// other frame gets a `storage` event and re-applies live, with no reload.
// Apply with persist:false so we don't write storage again (no echo loop).
try {
  window.addEventListener('storage', function (e) {
    if (!e || e.key !== WUI.LANG_KEY || !e.newValue) return;
    var next = e.newValue === 'ar' ? 'ar' : 'en';
    if (next !== WUI.i18n.getLang()) WUI.i18n.setLang(next, { persist: false });
  });
} catch (e) {}

// --- top-chrome language toggle (WebEOC) ----------------------------------
// Board views run in nested same-origin iframes; inject the toggle into the TOP
// instance chrome (div[data-test="right-menu"]) so it rides on the outer header
// regardless of which board frame you are in. The click handler is a SELF-
// CONTAINED inline onclick that runs in the top document's realm and only flips
// localStorage['wui-lang'] — the storage sync above re-applies the language in
// every frame with no reload, and new frames read it on boot. Safe no-op where
// that chrome selector is absent (docs site, standalone pages).
function wuiTopDoc() {
  try {
    if (window.parent && window.parent.parent && window.parent.parent !== window) {
      return window.parent.parent.document;
    }
  } catch (e) {}
  try { return window.top.document; } catch (e2) {}
  return null;
}
WUI.i18n.mountTopToggle = function () {
  var doc = wuiTopDoc();
  if (!doc) return false;
  if (doc.getElementById('wui-lang-toggle-top')) return true; // another frame mounted it
  var menu = doc.querySelector('div[data-test="right-menu"]') || doc.querySelector('[data-test="right-menu"]');
  if (!menu) return false;
  var a = doc.createElement('a');
  a.id = 'wui-lang-toggle-top';
  a.className = 'link';
  a.style.cursor = 'pointer';
  a.setAttribute('title', 'Language / اللغة');
  a.innerHTML = '<i class="fas fa-globe-asia" style="font-family:\'FontAwesome\'"></i> <span class="wui-lang-lbl"></span>';
  a.setAttribute('onclick',
    "try{var k='wui-lang';var c=localStorage.getItem(k)==='ar'?'ar':'en';var n=c==='ar'?'en':'ar';" +
    "localStorage.setItem(k,n);var s=this.querySelector('.wui-lang-lbl');" +
    "if(s)s.textContent=(n==='ar'?'English':'\\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629');}catch(e){}");
  menu.insertBefore(a, menu.firstChild); // prepend, like the legacy button
  var lbl = a.querySelector('.wui-lang-lbl');
  if (lbl) lbl.textContent = (WUI.i18n.getLang() === 'ar' ? 'English' : 'العربية');
  return true;
};
(function () {
  var tries = 15;
  function attempt() {
    var done;
    try { done = WUI.i18n.mountTopToggle(); } catch (e) { done = false; }
    if (!done && --tries > 0) setTimeout(attempt, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attempt);
  else attempt();
})();
