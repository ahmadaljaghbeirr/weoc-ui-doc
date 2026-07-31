# Task C — WUI.kanban() implementation report

## What was built

- `JS/wui-kanban.js` — `WUI.kanban(el, opts)` factory, matching `wui-charts.js`'s established
  pattern (`{ update, addCard, removeCard, destroy }` handle, `console.warn` + `null` on bad
  config, `window.WUI` registration). Native HTML5 drag-and-drop (`dragstart`/`dragend`/
  `dragover`/`dragleave`/`drop`), delegated on the board's own container element (not
  `document`, unlike the jQuery-delegated reference board — this library has no jQuery
  dependency and needed per-instance listeners so multiple boards on one page don't interfere).
- `CSS/weoc-ui/weoc-kanban.css` — board/column/card styles per the spec's markup shape, plus
  an optional per-card accent stripe (see "Scope addition" below). Token-only throughout.
- `docs/docs/kanban.html` — new doc page: hero, overview, setup, full API reference tables,
  rendered-markup reference, a dedicated "Card Accents" swatch section, a 4-column Task Board
  demo mirroring `TaskManagement`'s real shape (Open/In Progress/Completed/Rejected) with
  realistic EOC sample data, a 3-column To Do/Doing/Done demo with a genuinely different column
  set, an API-methods demo (`addCard`/`removeCard`/`destroy` buttons + a live log line), error
  handling table, and `destroy()` notes.
- `docs/i18n/kanban.js` — EN/AR registrations for every `data-wui-i18n`/`-html` marker on the
  page (36 entries).
- `docs/docs-shell.js` — added `'kanban'` to the `I18N_PAGES` array (the one explicitly
  sanctioned additive line). By the time I finished, Task B's heatmap commit
  (`432b3c7 Add WUI.heatmap risk-grid component`) had already landed and includes this same
  line (plus its own `'heatmap'` entry) — `git diff` now shows no delta on this file, so it is
  **not** included in my commit; nothing to add.

## Reference mechanics followed (eoc-makeover/TaskManagement/out/board.web ~1649-1839)

- `dragstart`: `dataTransfer.setData('text/plain', cardId)`, deferred (`setTimeout(fn, 0)`)
  class-add so the native drag-image snapshot isn't visually altered before capture — same
  reasoning as the reference board's own `setTimeout(fn, 0)`.
- `dragover`/`dragleave`: toggle `.is-drag-over` on the column body for drop-target feedback.
- `drop`: **move the DOM node into the target column FIRST**, then decide — this is the
  reference board's own documented approach ("Move card visually first — cancel will revert if
  needed"), adapted from a hardcoded 4-status `colStatusMap` to reading `data-column-key` off
  the ancestor `.wui-kanban-col` elements, so any `opts.columns` configuration works.
- The reference board's own confirmation modal (`openKanbanStatusModal`) was deliberately
  **not** ported — per the spec, the library only exposes `opts.onBeforeMove(card, fromKey,
  toKey)` and lets the consuming board decide what UX (if any) gates the commit.

## A real bug found and fixed via live testing (not just a synthetic-test artifact)

First implementation captured `originalParent`/`originalNext` locally in `onDrop` but referenced
the **outer**, shared `draggedCard`/`draggedId` variables inside the `Promise.resolve(result)
.then(...)` revert callback. The HTML5 DnD spec fires `dragend` on the source element
immediately after `drop` completes, synchronously in the same task — `onDragEnd` nulls those
outer variables before the `.then()` microtask ever runs. Result: every rejected move's revert
callback ran against `null`, silently doing nothing (the DOM move to the target column had
already committed synchronously and never got undone) instead of snapping back. This is not a
synthetic-test-only edge case — real native drags fire `dragend` right after `drop` too, so this
would have broken the reject path in production on every single rejection, not just fast ones.

Fix: capture `movingCard`/`movingId` as **local** variables at the top of `onDrop`, and use those
(not the outer `draggedCard`/`draggedId`) inside the async revert callback. Also hardened
`onDragStart`'s deferred class-add (`draggingClassTO`, cleared in `onDragEnd`) so an abnormally
fast drag can't re-add the `.wui-kanban-card-dragging` class after `dragend` already tried to
remove it.

Live re-test after the fix (see Verification below) confirmed the reject path now correctly
reverts the DOM, updates counts, and the transient `.wui-kanban-card-rejected` cue is added and
removed as designed.

## Scope addition: `opts.cards[].accent`

Added mid-task per an explicit follow-up instruction from the coordinator: an optional
`accent` field per card, rendering a colored left-edge stripe. Vocabulary is **exactly**
`.wui-badge`'s existing set (checked `CSS/weoc-ui/weoc-labels.css` and `weoc-tier-colors.css`):
`'primary'|'secondary'|'success'|'warning'|'danger'|'info'|'tier-1'|'tier-2'|'tier-3'|'tier-4'`
— no new vocabulary invented. Visual recipe mirrors `.wui-card.has-accent.<color>::before`
already established in `weoc-containers.css` (4px inline-start bar, rounded on the inline-start
corners only, `inset-inline-start` for RTL correctness) rather than inventing a new treatment.
Unrecognized/omitted `accent` → no stripe, card renders exactly as before this option existed
(no warning logged — purely cosmetic and additive, consistent with how `.wui-badge`'s own
variant classes are unvalidated). Demonstrated live: the Task Board demo color-codes 5 of 7
cards by priority and deliberately leaves 2 without an accent; the different-column-set demo
uses tier accents (`tier-1`/`tier-2`/`tier-4`) instead, keyed to work-stream, with 1 card left
unaccented — between the two, 9 of the 10 accepted values appear in live, working demos, and all
10 are documented in a dedicated swatch reference table.

## Verification performed

**Static:**
- `grep -nE '#[0-9a-fA-F]{3,8}\b|rgb\(|rgba\(' JS/wui-kanban.js CSS/weoc-ui/weoc-kanban.css docs/docs/kanban.html docs/i18n/kanban.js` — **zero matches** (confirmed twice, once after the accent addition). Every color is `var(--color-*)`/`var(--tier-*-color)`.
- Confirmed every CSS custom property referenced (`--color-bg`, `--color-surface`, `--color-30`,
  `--color-10`/`-light`/`-muted`, `--color-border`, `--color-secondary`/`-light`, `--color-text-
  primary`/`-secondary`, `--color-danger`/`-glow`, `--radius-sm`, `--border-radius`, `--space-*`,
  `--text-*`, `--font-*`, `--widget-shadow`, `--tier-1..4-color`) actually exists in
  `agency-theme.css` by grep, after an initial mistake (`--color-20`, which does not exist —
  fixed to `--color-bg`/`--color-surface`, the correct semantic aliases `wui-charts.js`'s own
  comments document).

**Live browser (served the repo root via `python -m http.server`, driven via `claude-in-chrome`):**
- Page loads, 0 console errors on load.
- `addCard()` — clicked "Add sample card" button, new card appeared in Open, count 3→4. Confirmed via screenshot.
- `removeCard()` — clicked "Remove a card" button, card 103 removed from Open, log line correct. Confirmed via screenshot + DOM read.
- Drag-and-drop mechanics: **could not use raw OS-level mouse drag** through the `computer` tool — HTML5 DnD is well known to be unreliable via synthetic mouse-move simulation in browser automation (the drag doesn't originate a real OS drag session). Instead verified by dispatching real `DragEvent`s with a real `DataTransfer` object at every stage (`dragstart`→`dragover`→`drop`→`dragend`) directly against the page's actual, unmodified event listeners via `javascript_tool` — this exercises the real production code paths (not a mock), just skips OS-level mouse input. Tested:
  - Every column-pair move in the 4-column demo (open→in-progress, in-progress→completed, completed→open, in-progress→rejected, open→rejected, rejected→completed) — all moved correctly, counts updated correctly.
  - `onBeforeMove` commit path (`window.confirm` mocked `true`) — card moved into Rejected, log line correct.
  - `onBeforeMove` reject path (`window.confirm` mocked `false`) — **this is where the bug above was caught**: initial run showed the card visually stuck in the target column; after the fix, re-tested and confirmed the card snaps back to its exact original position, `.wui-kanban-card-rejected` class applied then auto-removed after ~500ms, counts reverted correctly.
  - The different-column-set (3-column) demo — drag between `todo`/`doing`/`done` confirmed working.
- Error paths: `WUI.kanban(el, {})` → `console.warn` + returns `null` (confirmed both the return value and the actual console message). A card with an unknown `columnKey` → board still renders, bad card omitted, console warns with the card id (confirmed both DOM state and console message).
- `opts.onBeforeMove` omitted → move commits unconditionally (confirmed on a scratch board).
- `destroy()` — clicked the real "Destroy board" button, confirmed `innerHTML` cleared and the `data-wui-kanban-id` attribute removed from the container.
- **Theme switching (per coordinator's addendum)** — switched the docs site through several agency-theme palettes (Crimson, Emerald) and toggled light/dark, live, without reloading. Confirmed by screenshot: column backgrounds, card backgrounds, borders, badge colors, and the new accent stripes **all** updated correctly and immediately on every switch — no JS re-render is involved (the component never reads `getComputedStyle`; it only ever writes semantic class names, so re-theming is pure CSS cascade, same reasoning `WUI.barRow()` documents in `wui-charts.js`).
- **RTL/Arabic** — toggled the site language; confirmed the full page (including every new `docs_kanban_*` string) rendered correctly in Arabic under RTL layout, sidebar mirrored, no layout breakage.

## Barrel-file line the controller needs to add

`CSS/weoc-ui/weoc-ui-core.css`, inside the module list (after `weoc-charts.css`, or wherever the
controller groups it alongside the other two new components):

```css
@import url("weoc-kanban.css");
```

No JS asset-loading-list line is needed from the controller for the demo page itself (this
page loads `wui-kanban.js` directly in its own `<head>`, same pattern `charts.html` uses for
`wui-charts.js`), but per the plan, if `docs-shell.js`'s `ensureGlobalAssets()` should
site-wide-lazy-load `wui-kanban.js` the way it does for `wui-charts.js`, the line is:

```js
if (!window.WUI || !window.WUI.kanban) jobs2.push(loadScript(shared + 'JS/wui-kanban.js'));
```

(placed alongside the existing `if (!window.WUI || !window.WUI.chart) jobs2.push(...)` line in
the `jobs2` array inside `ensureGlobalAssets`).

`docs-shell.js`'s `NAV` array (nav entry for `kanban.html`) was left untouched, per the plan —
controller adds it in the follow-up pass.

## Self-review findings

- Found and fixed the `draggedCard`/closure-vs-microtask bug described above before commit —
  this was the single most important thing live testing caught; a purely code-read review would
  likely have missed it since the bug only manifests once `dragend` and the `.then()` callback
  race, which requires either very fast dragging or (as here) synthetic event dispatch.
- Escaping: `card.id`/`card.title`/`meta.assignee`/`meta.dueDate`/`col.label` are all passed
  through `_escHtml`/`_escAttr` before being concatenated into the `innerHTML` string — board-
  supplied data is never trusted as markup.
- `_cardEl` lookup avoids `querySelector('[data-card-id="..."]')` with unescaped ids (would
  break/be exploitable if an id contains a `"`); walks the NodeList and compares with
  `getAttribute` instead.
- No `wui-kanban.js` reference to `getComputedStyle` or any resolved color — confirmed this
  component needs no `wui:themechange` listener at all (unlike `wui-charts.js`, which must
  destroy/recreate on theme change because uPlot/canvas bake in resolved colors at draw time).
- Did not touch `CSS/weoc-ui/weoc-ui-core.css` or `docs-shell.js`'s `ensureGlobalAssets()` JS
  asset list, per the plan.
- Did not touch `agency-theme.css`, `weoc-card-group.css`, `CSS/weoc-ui.zip`, or any of the new
  `agency-theme-*.css` variant files (all pre-existing uncommitted user changes, confirmed via
  `git status` before starting and left alone throughout).
- Did not touch anything under `.worktrees/`.

## Concerns / open items for the controller

- `docs-shell.js`'s `I18N_PAGES` line is already committed (by Task B's heatmap commit, which
  picked up my in-progress edit alongside its own) — my own commit therefore does not touch
  `docs-shell.js` at all, since `git diff` shows no delta against HEAD for that file.
- **Unplanned concurrent edit to `docs/docs/kanban.html` by a fourth, unbriefed agent.** While I
  was mid-task, a system notification surfaced that `docs/docs/kanban.html`'s `<head>` had been
  edited externally to add `CSS/sweetalert2.min.css`, `CSS/sweetalert2-weoc-theme.css`,
  `JS/sweetalert2.all.min.js`, and `JS/wui-alert.js` (all four files exist on disk, confirmed),
  citing `docs/superpowers/specs/2026-07-31-sweetalert-design.md` — a spec I was never briefed
  on and that is unrelated to this plan's three tasks (table hook / heatmap / kanban). This is
  **not** either of the two agents I was told about (table CSS fix, heatmap) — evidently a
  separate, uncoordinated initiative also touching this exact file concurrently. I left the
  injected `<link>`/`<script>` tags in place (did not revert them) since they're inert as far as
  my code is concerned — my `onBeforeMove` demo still calls plain `window.confirm()`, not
  `WUI.confirm()`, so nothing in my own logic depends on or is broken by them. Reloaded and
  confirmed 0 console errors with these includes present. **I deliberately did not integrate
  `WUI.confirm()` into the reject-path demo** — that would be scope creep against an
  unbriefed spec I have no instructions to implement; if that integration is wanted, it should
  come as an explicit, separate instruction (from whoever owns the sweetalert-design spec, or
  the controller after reconciling it with this plan). Worth the controller's attention: two
  unrelated in-flight efforts are now landing edits in the same file outside the coordination
  this plan set up for Tasks A/B/C.
