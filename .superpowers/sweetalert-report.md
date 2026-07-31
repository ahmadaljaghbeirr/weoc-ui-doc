# Task D: SweetAlert2 vendored + themed, wrapped as WUI.alert/WUI.confirm

Status: **DONE**

## What was built

- `JS/sweetalert2.all.min.js` — real vendored SweetAlert2 v11.26.25 "all" UMD bundle, downloaded from `https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js`. 79,150 bytes. Verified genuine: header comment `/*! sweetalert2 v11.26.25 ... */`, `window.Swal` exists, `typeof Swal.fire === 'function'`, valid JS (`node --check` passes), size in the expected 60-80KB range.
- `CSS/sweetalert2.min.css` — matching vendored stylesheet, same source path, 30,251 bytes. Confirmed real class names by reading it directly (`.swal2-popup`, `.swal2-title`, `.swal2-html-container`, `.swal2-confirm`, `.swal2-cancel`, `.swal2-icon`, etc.) and confirmed it exposes most of its own theming as `--swal2-*` custom properties on `:root` (52 of them).
- `CSS/sweetalert2-weoc-theme.css` — flat under `CSS/`, not `CSS/weoc-ui/`, per the explicit placement instruction. Remaps all real `--swal2-*` tokens to real weoc-ui tokens confirmed against `CSS/weoc-ui/agency-theme.css` (not invented): popup shell matches `.wui-modal-dialog` (weoc-overlays.css), buttons match `.wui-btn.primary/.secondary` (weoc-interactive.css), inputs match `.form-control` (weoc-forms.css). Icon ring colors (hardcoded hex in the vendor CSS, no variable) are remapped via higher-specificity class selectors (`.swal2-icon.swal2-success` etc.); `'question'` has no dedicated severity token in this library, so it maps to `--color-secondary` (same reasoning as `wui-charts.js`'s `_DEFAULT_PALETTE` using `'secondary'` as a neutral filler — noted inline).
- `JS/wui-alert.js` — flat in `JS/`, matching `wui-charts.js`/`wui-heatmap.js`/`wui-kanban.js`'s file placement. Implements `WUI.alert(opts)` and `WUI.confirm(opts)` per the spec. Deliberately does **not** follow the `WUI.<name>(el, opts)` shape the other components use — a SweetAlert2 popup is a global overlay with no caller-supplied host element, so there's nothing for an `el` argument to do; this is called out explicitly in the file's header comment as an intentional, spec-driven exception, not an oversight. `WUI.confirm()` resolves a plain boolean (`result.isConfirmed`), never SweetAlert2's own richer result object. Both fall back to `console.warn` + native `window.alert()`/`window.confirm()` (wrapped in a resolved `Promise` for a uniform call shape) when `window.Swal` is undefined.
- `docs/docs/kanban.html` (Task C's file) — reject-confirmation demo swapped from native `confirm()` to `WUI.confirm()` in both the live JS block and the markup/code-panel `<template>`. Added the SweetAlert2 + `wui-alert.js` `<link>`/`<script>` tags to the page head (same "load directly here, not yet in docs-shell.js's global list" pattern already used for `wui-kanban.js`). Updated the Setup section with the additional load-order snippet, and updated the "Reject Path" callout prose (and its `docs/i18n/kanban.js` EN/AR strings, `docs_kanban_25` + new `docs_kanban_37`) to accurately describe the new themed-popup behavior instead of the old native-`confirm()` wording.

## Two real bugs found and fixed during verification (not precautionary — both reproduced live)

1. **Stray `*/` inside a header comment silently dropped the entire `:root` override block.** My original header prose read `--swal2-*/agency-theme.css token values`, and that literal `*/` closed the CSS comment early. Everything through the next real `*/` (several lines later) then parsed as garbage, and the browser silently dropped the whole `:root {...}` rule — confirmed via live CSSOM inspection (`document.styleSheets[...].cssRules` showed 12 rules with **no** `:root` entry at all). Fixed by rewording to `--swal2-* / agency-theme.css` (space added). Re-verified: the `:root` rule now parses with all 52 properties.

2. **`sweetalert2.all.min.js` self-injects its own duplicate default `<style>` at script-load time**, landing after any static `<link>` in the document. This is because the "all" UMD bundle embeds its own copy of the default CSS and appends it to `<head>` when the script runs — confirmed by finding a ~30KB inline `<style>` element (byte-identical in size to the vendored `sweetalert2.min.css`) that wasn't there before the script loaded. Since that injected block re-declares the same `:root { --swal2-confirm-button-background-color: #7066e0; ... }` etc. as sweetalert2.min.css, with identical `:root` selector specificity, and it always lands textually after my theme `<link>`, it was winning on pure source order — my override never took effect for anything routed through a `--swal2-*` custom property. Fixed by adding `!important` to every declaration in the `:root` block only (documented at length in the file's header comment, with the reasoning for why the class-selector overrides elsewhere in the file do **not** need it — they're already higher-specificity than SweetAlert2's own `:where()`-diluted selectors, so they win on specificity regardless of order). Re-verified via live `getComputedStyle(document.documentElement)` and the vendor-sheet-disabled test below.

## What was verified and how

Served the repo locally (`python -m http.server`) and used `claude-in-chrome` browser automation against `docs/docs/kanban.html`.

- **Genuineness**: `typeof window.Swal === 'function'`, `typeof Swal.fire === 'function'`, real class names read directly from the vendored CSS, `node --check` passes on both new JS files.
- **Token resolution (ground truth, not screenshots — see caveat below)**: `getComputedStyle(document.documentElement).getPropertyValue('--swal2-confirm-button-background-color')` correctly resolved to `#4a8fe7` (`--color-10` dark) under `data-theme="dark"`, and to `#1a5fb4` (`--color-10` light) after forcing `data-theme="light"` live — confirmed on `document.documentElement`, `document.body`, `.swal2-container`, `.swal2-popup`, and `.swal2-confirm` (the button itself) all showing the same correctly-resolved value. `--swal2-background` correctly tracked `--color-30` (`#242d3a` dark → `#ffffff` light) the same way. This is the "confirm re-theming works after a live theme switch, in at least 2 different themes" requirement, verified via the CSS cascade directly rather than pixels (see caveat).
- **`WUI.confirm()` boolean contract**: verified all three outcomes resolve as plain booleans — Confirm-button click → `true`, Cancel-button click → `false`, real `Escape` keypress (dispatched via the browser automation tool's actual key-press, not a synthetic `KeyboardEvent` which SweetAlert2's own listener didn't pick up) → `false`.
- **Live Kanban integration, end to end**: dropping a real card onto the "Rejected" column (simulated via a full native `dragstart`/`dragenter`/`dragover`/`drop`/`dragend` `DragEvent` sequence with a real `DataTransfer` — plain mouse-drag automation does not trigger native HTML5 DnD in this environment) correctly fired `wui-kanban.js`'s drop handler → the demo's `onBeforeMove` → `WUI.confirm({title:'Reject this task?', ...})` → a real themed SweetAlert2 popup with the card's actual title interpolated into the body text and "Reject"/"Cancel" buttons (confirming `confirmText`/`cancelText` mapping). Clicking Cancel correctly snapped the card back to "In Progress" (confirmed via DOM query + the demo's own log line: `onBeforeMove: "..." REJECTED — snapped back to in-progress.`). Re-running and clicking Reject (Confirm) correctly committed the move into "Rejected" (log line: `onBeforeMove: "..." moved in-progress → rejected (confirmed).`).
- **Fallback path**: temporarily deleted `window.Swal`, monkey-patched `console.warn`/`window.alert`/`window.confirm` to capture calls, called both `WUI.alert()` and `WUI.confirm()`. Confirmed: `console.warn` fired for both (2 calls, correct message), native `window.alert()` was called for `WUI.alert()`, native `window.confirm()` was called for `WUI.confirm()` with the combined `title + "\n\n" + text` message, and `WUI.confirm()` still resolved a plain boolean (`true`) wrapped in a `Promise`.
- **Console**: zero errors on a clean full page load and through the entire interaction sequence above (checked via `read_console_messages`).

### Verification caveat — screenshots are not reliable evidence of exact rendered color in this environment

While diagnosing the two bugs above I discovered that **this specific `claude-in-chrome` browser session force-repaints every element's `background-color` to a fixed value** (`rgb(30, 33, 34)`), independent of any real CSS — confirmed by creating a brand-new `<div>` from scratch with an explicit inline `background-color: #4a8fe7 !important` and finding its `getComputedStyle().backgroundColor` still returned `rgb(30, 33, 34)`, and by finding the exact same value on `<body>`, the sidebar, and `<html>` itself, all of which are real weoc-ui elements with entirely different declared colors. This is a rendering-layer artifact of the automated browser profile (likely a forced/auto-dark-mode setting), not a CSS cascade issue — it appeared identically regardless of which stylesheet or theme was active. Because of this, the popup's exact rendered color in my screenshots looks muddy/uniform and is **not** trustworthy evidence by itself. I relied on direct CSSOM/computed-custom-property inspection instead (see above), which is unaffected by this artifact and is the actual ground truth for whether the CSS cascade resolves correctly. Layout/structure (dialog centering, icon shape, spacing, button presence and labels, backdrop) IS visible correctly in the screenshots. Someone verifying in a normal (non-automated) browser should see the popup rendered in real weoc-ui colors — worth a quick manual sanity check if in doubt.

## Files changed

- `JS/sweetalert2.all.min.js` (new, vendored)
- `CSS/sweetalert2.min.css` (new, vendored)
- `CSS/sweetalert2-weoc-theme.css` (new)
- `JS/wui-alert.js` (new)
- `docs/i18n/kanban.js` (modified — `docs_kanban_25` reworded, `docs_kanban_37` added, EN + AR)
- `docs/docs/kanban.html` (modified — see note below on commit attribution)

## Note on `docs/docs/kanban.html` and commit attribution

Task C's agent and this task shared the same working tree (per the plan's instruction to work from the main checkout, not a worktree). While I was mid-edit on `docs/docs/kanban.html`, Task C's agent committed its own work (`a5d7931 feat(kanban): add WUI.kanban() drag-and-drop board component`) at essentially the same timestamp as my edits, and that commit's snapshot of the file already includes my SweetAlert2 `<link>`/`<script>` tags and `WUI.confirm()` swap (confirmed: `git diff HEAD -- docs/docs/kanban.html` is empty, i.e. my edits are already captured in that commit). This means my own Task D commit will **not** show `docs/docs/kanban.html` as changed — the content is correct and present in the repo, it's just attributed to Task C's commit rather than mine, purely as a side effect of the shared working tree's timing. No action needed, just noting it so the controller isn't confused looking for a kanban.html diff in my commit.

## Barrel-file lines for the controller (not applied — left for the controller per instructions)

**`CSS/weoc-ui/weoc-ui-core.css`** — add one `@import` line to the existing list (around line 62, after `weoc-charts.css`):
```css
@import url("../sweetalert2-weoc-theme.css");
```
(Relative path needs `../` because this file is flat under `CSS/`, not `CSS/weoc-ui/`, unlike this library's other first-party component CSS.)

**`docs/docs-shell.js`** — `ensureGlobalAssets(root)` (around line 387-449), two additions:
1. New CSS, alongside the existing `ensureCSS(shared + 'CSS/...')` calls (e.g. near the `tom-select`/`flatpickr` block):
   ```js
   ensureCSS(shared + 'CSS/sweetalert2.min.css');
   ensureCSS(shared + 'CSS/sweetalert2-weoc-theme.css');
   ```
   (Second line becomes redundant once the `weoc-ui-core.css` `@import` above lands, but harmless either way — `ensureCSS` already dedupes by substring match on `href`. The controller may choose to drop the second line once the `@import` is wired, since `weoc-ui-core.css` is already unconditionally loaded via a `<link>` on every docs page.)
2. New JS, alongside the existing `if (!window.X) jobs.push(loadScript(...))` guards:
   ```js
   if (!window.Swal) jobs.push(loadScript(shared + 'JS/sweetalert2.all.min.js'));
   ```
   `wui-alert.js` itself should load **after** `Swal` is available — either push it as a `.then()` continuation after the `jobs` `Promise.all()` resolves (same place the "Factory wrappers ... must load AFTER their respective libraries" comment already flags), or simply always-load it unconditionally alongside `weoc-anim.js`-style factory wrappers since it's cheap and idempotent (`WUI.alert`/`WUI.confirm` are just added to the namespace, safe to redefine).

No dedicated `docs/docs/*.html` page was created for `WUI.alert`/`WUI.confirm` in this pass, per the plan's explicit deferral ("doesn't need its own dedicated doc page in this pass unless a natural home is obvious ... decide at that time"). `docs/docs/feedback.html` (Overlays/confirmation content already lives there, e.g. its "Plain confirmation" example) looked like the most natural future home when I checked it, but I did not add content there — that's a call for whoever does the controller pass in step 4 of the plan.

## Self-review findings / concerns

- The two bugs above were real, not hypothetical — both reproduced and were fixed with verification, not just patched blind.
- `!important` is scoped strictly to the `:root` custom-property block, with the reasoning documented inline; I did not reach for it as a first resort elsewhere.
- `'question'` icon color → `--color-secondary` is a judgment call (no dedicated token exists) — flagged inline in the CSS and in this report per the "escalate design judgment calls" guidance, though I judged it non-blocking since the spec's own Global Constraints direct reusing existing severity tokens rather than inventing new ones, and `wui-charts.js` already establishes `'secondary'` as the correct neutral filler in an analogous situation.
- Did not touch `CSS/weoc-ui/weoc-ui-core.css` or `docs-shell.js`'s asset-loading list, per instructions — exact lines above.
- Did not touch `CSS/weoc-ui/agency-theme.css`, `CSS/weoc-ui/weoc-card-group.css`, the `agency-theme-*.css` variant files, or `CSS/weoc-ui.zip` — all pre-existing uncommitted user work, left untouched.
- Committed only the files this task owns: `JS/sweetalert2.all.min.js`, `CSS/sweetalert2.min.css`, `CSS/sweetalert2-weoc-theme.css`, `JS/wui-alert.js`, `docs/i18n/kanban.js`.
