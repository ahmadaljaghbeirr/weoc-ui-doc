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

## Review fix: hardcoded `black` color literal

Status: **DONE**

### Finding

A review of the SweetAlert2 theme override (`CSS/sweetalert2-weoc-theme.css`) flagged an Important issue at (then) lines 97-98:

```css
--swal2-action-button-hover: black 8% !important;
--swal2-action-button-active: black 16% !important;
```

These feed SweetAlert2's own built-in `color-mix(in srgb, var(--swal2-confirm-button-background-color), var(--swal2-action-button-hover))` pattern on `.swal2-confirm`/`.swal2-deny`/`.swal2-cancel` (confirmed by reading the vendored `CSS/sweetalert2.min.css` directly: the compiled rule is exactly that shape, and the vendor's own default is `black 10%` for both hover and active). The literal `black` violated the spec's "zero hardcoded colors — real weoc-ui tokens only" constraint and, more importantly, wasn't guaranteed to keep darkening correctly under every future agency palette.

### Investigation

Checked this codebase's own established hover-darkening mechanisms before picking a replacement:
- `CSS/weoc-ui/weoc-interactive.css` `.wui-btn.primary/.danger/.success/.info/.warning:hover` use `filter: brightness(1.03-1.06)` (a *lighten*, not a color-mix-toward-dark) — not directly reusable as a color token for `color-mix()`.
- No existing `color-mix(..., black, ...)`-style darken-on-hover pattern exists anywhere else in `CSS/weoc-ui/*.css`.
- Considered `var(--color-text-primary)` per the task's own suggested candidate, but rejected it: `CSS/weoc-ui/agency-theme.css` defines it as `#161a20` (near-black) in light mode but `#eef2f7` (near-white) under `[data-theme="dark"]` (line 308) — using it here would invert the effect in dark mode, mixing the button color toward near-white (a lighten) instead of darkening it, exactly the failure mode the review warned about.
- Found `--color-overlay` (`agency-theme.css` line 284: `rgba(0, 0, 0, 0.45)`) — the real weoc-ui scrim/backdrop token, already used elsewhere in this exact file for `--swal2-backdrop` (line 66), and consumed by `weoc-overlays.css` (modal backdrop, 3 usages) and `weoc-loader.css` (busy overlay). Checked every `agency-theme*.css` variant present in the repo (`agency-theme.css`, `-airy`, `-sand`, `-slate`, `-crimson`, `-deep`, `-emerald`, `-graphite`, `-daylight`, `-obsidian`, `-compact`, `-bak`) and its dark-mode block: `--color-overlay` is a dark/black-tinted rgba in **every** theme and **every** mode, by design (a backdrop scrim must always dim what's under it, regardless of surface color) — the one weoc-ui token that behaves exactly like `black` should here without ever flipping direction.

### Fix

`CSS/sweetalert2-weoc-theme.css` lines 97-98 (now ~110-111 after an explanatory comment expansion):

```css
--swal2-action-button-hover: var(--color-overlay) 8% !important;
--swal2-action-button-active: var(--color-overlay) 16% !important;
```

Kept the original 8%/16% mix percentages (hover lighter touch, active stronger) — no principled reason found to change them. Expanded the block's header comment to document the token choice, why `--color-text-primary` was rejected, and that `--color-overlay` carries its own alpha (~0.45 in the default theme) so the effective darken is a bit softer than an opaque `black` at the same percentage, but still strictly monotonic and directionally correct.

### Verification

Screenshots were **not** reliable evidence in this session — reproduced the exact same environment artifact documented earlier in this report (see "Verification caveat" above): `getComputedStyle()` for `color`/`background-color` on freshly created test elements returned a fixed `rgb(30, 33, 34)` / white regardless of the real declared CSS, and a live `WUI.confirm()` popup screenshot rendered as a uniform dark panel with no visible button fills, matching that known artifact. Falling back to computed-style inspection per the task's own contingency (option 2), explicitly instead of a visual check:

1. Confirmed via `getComputedStyle(document.documentElement).getPropertyValue(...)` that the raw custom-property strings resolve correctly and adapt per theme: `--swal2-confirm-button-background-color` = `#1a5fb4` (light) / `#4a8fe7` (dark); `--color-overlay` = `rgba(0, 0, 0, 0.45)` in **both** themes (confirming it never flips); `--swal2-action-button-hover`/`-active` correctly compose to `rgba(0, 0, 0, 0.45) 8%` / `16%`.
2. Since the browser's own paint pipeline was artifact-affected, replicated the CSS Color 4 `color-mix(in srgb, c1, c2 p2%)` algorithm by hand in JS (alpha-premultiplied mix, parsed from the raw resolved token strings via regex, not via any DOM color-resolution call) and computed the actual resulting RGB + relative luminance for rest/hover/active in both themes:
   - Light: rest `#1a5fb4` (lum 0.117) -> hover `rgba(25,91.4,173.2,.956)` (lum 0.108) -> active `rgba(23.9,87.5,165.8,.912)` (lum 0.098) — strictly decreasing.
   - Dark: rest `#4a8fe7` (lum 0.269) -> hover `rgba(71.2,137.6,222.3,.956)` (lum 0.247) -> active `rgba(68.2,131.7,212.8,.912)` (lum 0.225) — strictly decreasing.
   - Confirms darkening in the correct direction (not inverted, not lightening) in both themes, with active visibly darker than hover in both.
3. Confirmed the browser's actual CSS engine (not just my JS replica) accepts the real declaration: `CSS.supports('background', 'color-mix(in srgb, var(--swal2-confirm-button-background-color), var(--swal2-action-button-hover))')` returned `true`, and setting `el.style.background` to that exact string round-tripped through `cssText` unmodified (an invalid/unparseable value would have been silently dropped by the CSSOM setter instead).
4. Fired a real `WUI.confirm()` popup via the vendored `JS/wui-alert.js` on `docs/docs/kanban.html` (served locally) in both `data-theme="light"` and `data-theme="dark"` to confirm no console errors and that the popup renders with the real confirm/cancel buttons present and correctly labeled; did not rely on its screenshot pixel colors for the darkening claim, per the caveat above.

### Whole-file grep for other hardcoded colors

```
grep -inE '\b(black|white)\b' CSS/sweetalert2-weoc-theme.css   # only in prose comments describing the vendor default / vendor's own hardcoded hex, no live declarations
grep -inE '#[0-9a-fA-F]{3,8}\b' CSS/sweetalert2-weoc-theme.css  # only in prose comments quoting vendored hex values, no live declarations
grep -inE 'rgba?\(' CSS/sweetalert2-weoc-theme.css              # no matches at all
```

Confirmed: the `black 8%`/`16%` pair was the only real hardcoded-color violation in the file. Everything else that mentions `black`, `white`, or a hex value is inside a comment describing SweetAlert2's own vendored defaults (for context/justification), not a live CSS declaration.

### Commit

`361cb81` — `fix(alert): replace hardcoded black in SweetAlert2 hover/active mix with weoc-ui token`, on branch `bao-weoc-ui-updates`, 1 file changed (`CSS/sweetalert2-weoc-theme.css`, +16/-3).

## Review fix round 2: color-mix alpha-compositing bug

Status: **DONE**

### Finding

A second review round flagged the round-1 fix (commit `361cb81`) as an Important issue in its own right: replacing the hardcoded `black 8%`/`16%` with `var(--color-overlay) 8%`/`16%` fixed the "zero hardcoded colors" violation but introduced a real light-theme visual regression. `--color-overlay` is semi-transparent (`rgba(0,0,0,0.45)` in every theme), and CSS Color 4's `color-mix()` alpha-premultiplies: mixing an opaque button color toward a semi-transparent second color produces a semi-transparent *computed* `background-color` (alpha ≈0.956 at 8%, ≈0.912 at 16% — not 1.0). That translucent result then gets alpha-composited by the browser against whatever sits behind the button (the popup's `--color-30` surface). Under light theme, `--color-30` is light, so compositing pulled the "darkened" hover/active color back toward light — the confirm/deny/cancel buttons visibly got LIGHTER on hover and lighter still on press, the opposite of intent. Dark theme happened to look correct by coincidence (a dark backdrop reinforces darkening), which is why the round-1 verification (which checked raw custom-property strings and did the color-mix math, but did not model the alpha-compositing-against-backdrop step) missed it.

The review also confirmed there is no opaque, theme-invariant dark token anywhere in `agency-theme.css`/its variants to swap in as a drop-in replacement (`--color-black`/`--color-ink`/`--color-shadow`/`--color-90` — none exist).

### Fix

Abandoned the `color-mix()`-via-custom-property mechanism entirely rather than hunting for a different token. `CSS/sweetalert2-weoc-theme.css`:

- Removed `--swal2-action-button-hover` / `--swal2-action-button-active` from the `:root` block (they no longer exist in the file at all — SweetAlert2's own vendored default for these, `black 10%`, is also neutralized per-button below rather than left to leak through).
- Added six new class-selector rules after `button.swal2-styled:focus-visible`:
  ```css
  .swal2-styled.swal2-confirm:hover  { background-color: var(--swal2-confirm-button-background-color); filter: brightness(0.92); }
  .swal2-styled.swal2-confirm:active { background-color: var(--swal2-confirm-button-background-color); filter: brightness(0.84); }
  .swal2-styled.swal2-deny:hover     { background-color: var(--swal2-deny-button-background-color);    filter: brightness(0.92); }
  .swal2-styled.swal2-deny:active    { background-color: var(--swal2-deny-button-background-color);    filter: brightness(0.84); }
  .swal2-styled.swal2-cancel:hover   { background-color: var(--swal2-cancel-button-background-color);  filter: brightness(0.92); }
  .swal2-styled.swal2-cancel:active  { background-color: var(--swal2-cancel-button-background-color);  filter: brightness(0.84); }
  ```
  Each rule resets `background-color` back to the button's own base-color custom property (canceling the vendor's still-present `color-mix()` output for that property, so the old and new mechanisms don't stack/compound) and applies `filter: brightness()` for the actual darkening.
- Added `filter 0.15s ease` to `--swal2-action-button-transition` for a smooth hover/active change (previously only `background-color`/`box-shadow` transitioned).

**Why `filter: brightness()` structurally can't repeat this bug:** it multiplies the RGB channels of the *already fully composited, opaque, on-screen* pixel by a scalar. There is no second color, no alpha channel, and nothing to alpha-composite against a backdrop — brightness(0.92)/(0.84) darken whatever is actually rendered, unconditionally, in every theme, every time. This is categorically different from `color-mix()`, where the *result itself* can carry alpha depending on its inputs and therefore remains subject to a further compositing step the author has to reason about separately (and, in round 1, didn't).

**Why brightness(0.92)/(0.84) specifically:** they exactly mirror the file's own established 8%/16% darken intent (`1 − 0.08 = 0.92`, `1 − 0.16 = 0.84`), just expressed as a filter instead of a color-mix percentage — no new design decision, same visual target.

**Selector/specificity choice:** read the real vendored selectors from `CSS/sweetalert2.min.css` again rather than trusting the round-1 report's memory of them — confirmed they are `div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-confirm):hover` (and `:active`, and the `.swal2-deny`/`.swal2-cancel` equivalents). `:where()` always contributes zero specificity, so the vendor's effective specificity is `(0,1,2)` (one pseudo-class, two type selectors: `div`, `button`). The new rules use plain class selectors — `.swal2-styled.swal2-confirm:hover` — which are `(0,3,0)` (three class/pseudo-class components, zero type selectors) and win outright on specificity, consistent with how this file already overrides the icon-ring and close-button colors elsewhere (no `!important` needed, only the `:root` block carries `!important`, for the unrelated JS-self-injection reason documented in that block's own header comment).

**Investigated `.wui-btn` first, per the task's suggested starting point, and found it is NOT actually the matching pattern:** `.wui-btn.primary/.danger/.success/.warning/.info:hover` (`weoc-interactive.css`) all *lighten* via `filter: brightness(1.03–1.06)`, and `.wui-btn` has no `:active` filter rule at all (`.wui-fab:active` only does a `transform`, no brightness). The one place in this codebase that already does "darken on hover, darker still on active" via an unconditional filter is `.wui-badge.is-interactive:hover/:active` in `weoc-labels.css` (`brightness(0.82)` / `brightness(0.72)`) — that's the pattern actually mirrored here (same shape: filter-based, hover-then-stronger-active darkening), not `.wui-btn`. This discrepancy from the task's literal suggestion is called out inline in the new CSS comment so a future reader isn't confused searching `.wui-btn` for this exact mechanism.

### Verification

**Full paint-compositing check, not just the isolated CSS value** (the explicit point of this round):

1. Confirmed the rule wins the cascade *structurally*, not just definitionally: scanned every loaded stylesheet's `CSSRule` list at runtime for any rule setting the `filter` property that could plausibly match a SweetAlert2 button — found only the six new rules above; no other rule (including the JS-self-injected duplicate vendor `<style>` documented in Task D's original verification) sets `filter` on any matching selector. `button.matches('.swal2-styled.swal2-confirm:hover')` returned `true` while the button was under a real, physical mouse hover (`button.matches(':hover')` also `true`, confirmed via `claude-in-chrome`'s `computer` hover action, not a synthetic event) — i.e. the selector match is real, not just theoretical.
2. **Reproduced and diagnosed a second, distinct rendering artifact in this browser-automation session**, this time affecting `filter`/`background-color` reads via `getComputedStyle()` specifically on elements inside a *fired* SweetAlert2 popup (not the whole page, and not custom-property strings): setting `btn.style.setProperty('filter', 'brightness(0.5)', 'important')` directly on the real, connected, on-screen `.swal2-confirm` button and reading `getComputedStyle(btn).filter` immediately afterward returned `brightness(1)` — the inline style attribute (`btn.style.filter`) correctly reported `"brightness(0.5)"` was actually set (confirming the DOM write succeeded), but the computed-style *read* was wrong. Control test: an identical `<button class="swal2-styled swal2-confirm">` element created fresh and appended to `<body>` *outside* the fired popup correctly reported `getComputedStyle().filter === "brightness(0.5)"` for the same inline-style assignment. A screenshot of the live popup showed the same uniform flat-fill artifact Task D's original report first documented for `background-color` (all elements painted a single flat dark tone regardless of declared theme/CSS) — this is the same known environment issue, now shown to extend to `filter` reads specifically within a live Swal popup, not a defect introduced by this fix. Given this, `getComputedStyle()` on the real popup buttons could not be used as evidence either way (screenshots were already ruled out for the same underlying reason), so the check fell back to structural/mathematical verification per the task's own contingency:
3. Confirmed re-theming still works via the one channel unaffected by the paint artifact (raw custom-property token strings, not paint properties): `--swal2-confirm-button-background-color` = `#1a5fb4` (light) / `#4a8fe7` (dark, from Task D's original verification), `--swal2-deny-button-background-color` = `#dc2626` (light), `--swal2-cancel-button-background-color` = `#f4f6f9` (light) — all real, opaque, theme-correct values, confirming the base colors these filters apply to are themselves fine.
4. Hand-computed the exact effect of `filter: brightness()` (a simple, unambiguous per-channel scalar multiply — no alpha, no compositing, no ambiguity, unlike `color-mix()`) against every real base color:
   - Light confirm `#1a5fb4` (26,95,180) → hover ×0.92 → (24,87,166) → active ×0.84 → (22,80,151)
   - Light deny `#dc2626` (220,38,38) → hover → (202,35,35) → active → (185,32,32)
   - Light cancel `#f4f6f9` (244,246,249) → hover → (224,226,229) → active → (205,207,209)
   - Dark confirm `#4a8fe7` (74,143,231) → hover → (68,132,213) → active → (62,120,194)
   All four are strictly, uniformly decreasing on every channel simultaneously hover→active, which is guaranteed by construction (multiplying by a constant <1 can never increase any channel) — there is no theme-dependent backdrop step in this model at all, which is precisely why this approach cannot reproduce the round-1 bug: there is nothing in the formula that references, or composites against, whatever is behind the button.
5. Fired real `WUI.confirm()`-style popups (via `Swal.fire()` directly through the vendored `sweetalert2.all.min.js`, served locally with `python -m http.server`) on `docs/docs/kanban.html` in both `data-theme="dark"` (initial page state) and `data-theme="light"` (switched live), with `confirmButtonText`/`denyButtonText`/`cancelButtonText` all present, and confirmed zero console errors across the whole session (`read_console_messages`, unfiltered).

### Confirmed no hardcoded color literals reintroduced

```
grep -inE '\b(black|white)\b' CSS/sweetalert2-weoc-theme.css   # 2 hits, both inside prose comments (rejected-token discussion), no live declarations
grep -inE '#[0-9a-fA-F]{3,8}\b' CSS/sweetalert2-weoc-theme.css  # 2 hits, both inside prose comments quoting vendored hex, no live declarations
grep -inE '\b(rgba?|hsla?)\(' CSS/sweetalert2-weoc-theme.css    # no matches
grep -in 'color-mix' CSS/sweetalert2-weoc-theme.css             # 5 hits, all inside prose comments explaining why color-mix was abandoned, no live declarations
```

Also verified brace/paren balance (`{`×20 = `}`×20, `(`×143 = `)`×143) as a syntax sanity check since no CSS linter is wired into this repo.

### Concerns

- `getComputedStyle()`-based paint-property verification (the task's own suggested contingency) turned out to be unreliable in this specific session for elements *inside a fired Swal popup* specifically (not the whole page, and not for custom-property strings) — a narrower and previously-undocumented variant of the artifact Task D's report first found. Verification therefore rests on cascade/selector-match correctness (proven live) + the unconditional mathematical guarantee of `filter: brightness()` (no compositing step exists to get wrong) rather than a direct "read the final pixel" check. A manual sanity check in a normal (non-automated) browser, in both themes, is worth doing if in doubt — same caveat Task D's original report gave for the same underlying reason.
- Did not touch any file besides `CSS/sweetalert2-weoc-theme.css`.

### Commit

`00040d3` — `fix(alert): replace color-mix() hover/active darken with filter:brightness()`, on branch `bao-weoc-ui-updates`, 2 files changed (`CSS/sweetalert2-weoc-theme.css` +52/-19, `.superpowers/sweetalert-report.md` +156/0).
