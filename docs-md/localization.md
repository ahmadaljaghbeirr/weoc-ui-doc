# Localization

[← Index](README.md)

Live EN/AR switching with no page refresh. Static labels, JS-generated content, and cloned templates all re-localize from a single toggle, and the page direction flips to RTL.

## Live language toggle

Use the translate button in the header, or the button below. Nothing reloads. The idempotent `WUI.i18n.apply()` pass re-resolves every marked node from its stable key.

```html
<button class="wui-btn primary" data-wui-lang-toggle>Toggle EN / AR</button>
```

## Static markers

`data-wui-i18n="Key"` labels resolve on load and re-resolve on every toggle.

```html
<span class="wui-badge">Save</span>
<span class="wui-badge">Cancel</span>
<span class="wui-badge">Delete</span>
```

## JS-generated content

These list items are built in JavaScript with `WUI.i18n.mark(el, id)`. Because each node carries its key, they flip on toggle just like static markup, fixing the "frozen until refresh" bug.

```html
<ul id="demo-js-list"></ul>
```

## Cloned template

This card is cloned from a `<template>` after load, then localized with `WUI.i18n.apply(node)`. It re-localizes on toggle, fixing the "template resources never resolve" bug.

```html
<template id="demo-tpl">
  <div class="wui-card"><div class="wui-card-body"><span class="wui-badge">Tier 1</span></div></div>
</template>
<div id="demo-tpl-host"></div>
```

## API

All methods hang off the global `WUI.i18n`.

| Member | Purpose |
|---|---|
| `register(rows)` | Merge a flat `[{lang,id,value}]` array into the registry (en/ar). |
| `t(id, fallback)` | Look up a string in the current language. Falls back to `fallback`, then `id`. |
| `tFor(lang, id, fallback)` | Explicit-language lookup. |
| `getLang()` / `setLang(lang)` / `toggleLang()` | Read / set / flip the active language. `setLang` updates `<html dir lang>`, persists, re-applies, and fires `wui:langchange`. |
| `apply(root)` | Idempotent, re-runnable localization pass over a subtree. Call after injecting markup. |
| `mark(el, id)` | Set `data-wui-i18n` on a node and localize it in one call. |
| `mountTopToggle()` | Injects a language-toggle link into WebEOC's top chrome (`[data-test="right-menu"]`), walking up through nested same-origin iframes. Self-mounts on load with a retry loop; safely no-ops where that chrome selector is absent (e.g. this docs site). |
| `wui:langchange` | Event dispatched on `document.documentElement` on every `setLang`/`toggleLang` call, with `detail: {lang, rtl}`. Use this to re-run any custom rendering that depends on language. |
| `storage` event sync | WebEOC boards run in nested same-origin iframes. Changing the language in one frame persists it and fires a native `storage` event in every sibling frame, which re-applies live (without re-persisting, to avoid an echo loop) — no extra wiring needed. |

Declarative: `[data-wui-i18n="Key"]` (text), `[data-wui-i18n-attr="placeholder:Key"]` (attributes), `[data-wui-lang-toggle]` and `[data-wui-lang="ar"]` (controls). Legacy `<resource id>` / `[l-key]`, `[isresources="yes"][resourcekeys]`, `.resourceTip[data-resource]`, `.tooltip-localization[titleEN][titleAR]`, and the `window.getResource` / `changeLang` globals keep working.
