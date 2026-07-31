# Flatpickr time stepper + month dropdown + trigger icon: native fork

Branch: `bao-weoc-ui-updates` (worktree). This task went through three
architecture iterations in one session — documented here is the FINAL state
plus why the earlier two were abandoned.

## Iteration history (why this ended up as a vendor fork)

1. **External DOM-patch** (original task ask): narrow `suppressNumberWrap`'s
   `data-wui-no-number` opt-out to just `.flatpickr-current-month`, let
   weoc-ui's global `WUI.enhanceNumbers()` auto-wrap the time inputs into
   `.wui-number`, add an explicit `WUI.enhanceNumbers(fp.calendarContainer)`
   call in `onReady` for reliability. This worked for `flatpickr-factory.js`
   instances.
2. **Global hook fix** (first scope addition): a coordinator message flagged
   that `JS/webeoc-dynamic-list-filters.js` calls `flatpickr()` directly,
   bypassing the factory entirely — the month dropdown and time stepper never
   reached those instances. Fixed via `flatpickr.setDefaults({ onReady, ... })`,
   flatpickr's own documented global-config extension point (verified its
   shallow-merge semantics against the vendored source before relying on it).
3. **Native fork** (final, this report): the user made an explicit
   architecture-pivot decision — stop patching flatpickr's DOM from outside
   entirely, including the `flatpickr.setDefaults()` global hook and
   `WUI.enhanceNumbers()`/`build/src/interaction/number.js` coupling. Fork
   flatpickr's own compiled render code instead, so the custom month dropdown,
   time stepper, and (added mid-fork, folded into the same pass) trigger icon
   are all built natively, by flatpickr itself, for every `flatpickr()` call
   site with zero external wiring.

Iterations 1–2 are pure history now — none of that code exists in the final
state. Only iteration 3 is live.

## What changed (iteration 3, final)

### New file: `JS/flatpickr-weoc.js`
A hand-modified fork of `flatpickr/dist/flatpickr.js` v4.6.13 (the real
unminified compiled build the user dropped at repo root, fetched fresh from
unpkg as a fallback reference copy for cross-checking — same version as the
vendored one). This is now the **source of truth**; edit this file, not the
minified copies. Full rationale + line-by-line diff markers ("WEOC FORK") are
documented in its own header comment. Five changes from stock v4.6.13:

1. **`monthSelectorType` default: `"dropdown"` → `"static"`.** Stock
   `"static"` already meant "render a plain `<span class="cur-month">`
   instead of a native `<select>`" (previously only used internally for
   `showMonths>1`); `buildMonth()` now also turns that span into a themed
   `.wui-dropdown` month menu whenever `monthSelectorType !== "dropdown"` —
   i.e. by default. `monthSelectorType:'dropdown'` remains a working escape
   hatch back to the stock native `<select>`.
2. **Year field opt-out baked in.** `createNumberInput("cur-year", ...)` is
   completely untouched (still classic `numInputWrapper > input +
   arrowUp/arrowDown`), but its wrapper now gets
   `data-wui-no-number` set directly at construction time, so weoc-ui's
   unrelated global `WUI.enhanceNumbers()` auto-enhancer never wraps it into
   a `.wui-number` stepper (whose CSS reserves padding for +/- buttons sized
   for a normal form field and silently truncated the 4-digit year —
   "2026" → "202" — when this was first discovered). This is a correctness
   catch beyond what was literally asked in the pivot instructions: removing
   the DOM-patch approach entirely (as instructed) would have re-opened the
   original year-truncation bug, since nothing else protected the year field.
   Baking the opt-out into the fork closes it for every call site instead of
   requiring per-factory wiring.
3. **`createTimeStepperInput()`** — a bespoke, self-contained builder,
   parallel to (not replacing) `createNumberInput()`. Builds hour/minute/
   second as `numInputWrapper > .wui-number > input + .wui-number-btns`
   (same class names as weoc-ui's shared `.wui-number` component, reused
   purely for CSS/visual consistency — **zero JS coupling**: this file never
   calls `WUI.enhanceNumbers()` or anything from `build/src/interaction/
   number.js`/`overlays.js`). Buttons carry `data-fp-step="up"/"down"`
   (deliberately NOT weoc-ui's generic `data-wui-step`, to avoid colliding
   with overlays.js's own delegated `[data-wui-step]` click handler, which
   calls native `input.stepUp()/stepDown()` — that would have double-fired
   alongside this fork's own wiring since both match the same
   `.wui-number`-wrapped `<input type="number">`). `buildTime()`'s own
   `wireTimeStepper()` wires each button (via this instance's own `bind()`,
   so listeners are torn down correctly on `destroy()`) directly to
   `incrementNumInput()` — the **exact same internal function the stock
   arrowUp/arrowDown spans call**. This is a real behavioral upgrade over
   iteration 1's external approach: true wraparound (23→0), minute-rollover-
   bumping-the-hour, and AM/PM-flip-on-rollover all work natively, because
   the click handler goes through flatpickr's own `timeWrapper()`/
   `updateTime()` logic instead of approximating it with `stepUp()` +
   synthetic `dispatchEvent('input')`. The bound text field now also updates
   **instantly** on click (confirmed live — see Verification), not just on
   blur/close, since `incrementNumInput()` dispatches the real `"increment"`
   event flatpickr's own `timeContainer`-level listener is bound to.
4. **`buildMonthDropdownMenu()`** — builds the `.wui-dropdown`/
   `.wui-dropdown-item` month menu (reusing the exact weoc-overlays.css
   visual language and the exact `[data-wui-toggle]`/`WUI.open`/`close`
   interaction model every other dropdown in this library uses — that
   generic, already-correct layer is intentionally NOT reimplemented) inline
   during `buildMonth()`, instead of as a post-render DOM patch. The trigger
   `<span class="cur-month">` is wrapped (never replaced), because
   `updateNavigationCurrentMonth()` keeps writing `.textContent` to it on
   every `changeMonth()` redraw — completely unchanged by this fork.
5. **`wireTriggerIcon()`** (folded in mid-task, second scope addition — see
   below) — injects a real inline `<svg>` calendar/clock icon on the closed
   input, replacing a CSS `background-image` that had a color hardcoded into
   a data-URI SVG string.

### Trigger icon fix (scope addition)
`--fp-icon-date`/`--fp-icon-time` in `CSS/flatpickr-agency.css` were data-URI
SVG strings with `stroke='%23185fa5'` — a literal hex color baked into the
SVG markup itself. Background-image SVGs are opaque to the embedding page's
CSS, so this could never live-retheme via `var(--color-10)` like every other
icon in the library. Fixed by injecting a **real inline `<svg>` DOM node**
instead (`fpIconMarkup()` + `wireTriggerIcon()` in the fork, called from
`init()` right after `setupInputs()`), using `stroke="currentColor"` + a new
`.fp-icon-trigger { color: var(--fp-icon-color) }` CSS rule
(`--fp-icon-color: var(--color-10)`, replacing the two removed hardcoded-hex
tokens). Gated on the same `.flat-date`/`.flat-time`/`.flat-range-start`/
`.flat-range-end` classes board authors already use (pre-existing
convention — flatpickr itself has no concept of these classes); skipped
entirely when `self.config.wrap` is set. The input is wrapped in a new
`<span class="fp-icon-slot">` (`position:relative; width:100%`) so the icon
can be absolutely positioned via `inset-inline-end` (RTL-correct — confirmed
live, icon mirrors to the left edge under `dir="rtl"`).

**Verified via `document.querySelectorAll`**: `.fp-icon-trigger svg` is a
real `SVGElement` in the SVG namespace (`svgIsRealElement: true`,
`iconTextContentLength: 0`) — not a text-content leak. See "False bug report"
below for why this was flagged as broken and wasn't.

### `JS/flatpickr-factory.js` — simplified, not extended
Removed entirely: `suppressNumberWrap()`, `buildMonthDropdowns()`,
`wireDatePicker()`, `wrapHook()`, the `flatpickr.setDefaults()` global-hook
registration, the `_mdUid` counter, the `monthSelectorType:'static'`
injection in `initAll()`, and the defensive `onReady`-chaining guard. None of
this is needed anymore — the fix lives inside `flatpickr()` itself now, so it
applies to every call site (factory-driven or raw) with zero wiring. The
factory's header comment and inline vendor blob (the
`/* === BEGIN/END vendor === */` fallback copy for consumers that load
`flatpickr-factory.js` without a separate `flatpickr.min.js`) were updated to
match — the inline blob is now the SAME minified fork content, kept in sync
with the standalone file.

### `JS/flatpickr.min.js`
Replaced entirely with the minified fork (`terser JS/flatpickr-weoc.js -c -m`,
using `build/node_modules/terser` — had to `npm install` in `build/` first
since `node_modules/` is gitignored and wasn't present in this fresh
worktree). This is the file `docs-shell.js`'s `ensureGlobalAssets()` actually
loads for the docs site (`JS/flatpickr-factory.js`'s embedded vendor copy is
a secondary fallback path for other consumers — both are now kept in sync
from the same source).

### `CSS/flatpickr-agency.css`
- Removed `--fp-icon-date`/`--fp-icon-time` (hardcoded-hex data-URI SVGs),
  added `--fp-icon-color: var(--color-10)`.
- `.flat-date`/`.flat-range-start`/`.flat-range-end`/`.flat-time`: dropped
  `background-image`/`background-repeat`/`background-position`; kept
  (and converted to logical) `padding-inline-end` so text still clears the
  icon. Added `.fp-icon-slot`/`.fp-icon-trigger`.
- Removed the now-dead `.flatpickr-time .numInputWrapper span.arrowUp/
  arrowDown { display:none }` rule — those spans no longer exist in the DOM
  for hour/minute/second at all (native build never creates them), so there
  was nothing to hide.
- `.flatpickr-time .wui-number`/`-btns`/`-step` sizing overrides: **rewritten
  to use explicit pixel heights throughout** (`height:40px` on `.wui-number`
  and its input, `height:38px`/`top:1px;bottom:auto` on `.wui-number-btns`,
  `height:19px;min-height:0;flex:none` on each `.wui-number-step`) instead of
  `height:100%`/flex-based sizing inherited from ancestors. This was a real,
  reported bug (see "Bugs found and fixed" below) — the two chevron buttons
  were rendering collapsed onto each other rather than stacked with visible
  separation; pinning every dimension explicitly, rather than relying on a
  percentage-height chain through `.flatpickr-time .numInputWrapper`'s fixed
  40px, removed the ambiguity.
- Comments in the "Custom month dropdown" and "Time picker steppers" sections
  updated to describe the native-fork architecture instead of the old
  post-render DOM-patch approach.

## Bugs found and fixed during this pass

1. **Chevron buttons rendering collapsed/overlapping** (real bug, reported by
   the user via a live screenshot). Root cause: the scoped CSS relied on
   `.wui-number-btns`' base `top:1px;bottom:1px` absolute-stretch resolving
   against `.wui-number`'s `height:100%`, which itself depended on
   `.flatpickr-time .numInputWrapper`'s fixed 40px height resolving correctly
   through the cascade — plausible in principle, and my own automated
   geometry checks (`getBoundingClientRect`) showed it resolving correctly at
   the time, but evidently didn't hold in whatever exact rendering context
   produced the reported screenshot. Fixed by pinning every dimension in this
   chain to an explicit pixel value instead of relying on inherited
   percentages — removes the ambiguity entirely rather than trying to explain
   why the old chain sometimes didn't resolve as expected.
   **Verified live** post-fix by cloning the actual `.wui-number-btns` node
   into an isolated, unclipped, 10×-scaled debug overlay and screenshotting
   it directly (bypassing `.flatpickr-time`'s `overflow:hidden`, which was
   clipping earlier in-place scale attempts) — confirms an up-chevron and a
   down-chevron in two clearly separated cells with a visible divider border,
   zero overlap. Also re-confirmed via `getBoundingClientRect`: up button
   `y:321,h:19` (ends at 340), down button starts at exactly `y:340` —
   pixel-perfect adjacency, no overlap, no gap.

## False bug report — investigated, not a real bug

A coordinator message (relaying a live user screenshot) reported "literal SVG
markup rendering as visible text near the Copy/MARKUP area below the time
picker" — e.g. `</line><line x1="0" y1="3" x2="0" y2="6"></line>` appearing
as plain page text, the classic symptom of `.textContent =` instead of
`.innerHTML =` for SVG source.

**Investigated and confirmed this is NOT a bug.** `docs-shell.js` has an
established, pre-existing "wui-demo" pattern (its own comment: *"The
.wui-demo-preview holds the LIVE markup (the source of truth). We read its
innerHTML and render it as the Markup code box, so the code shown is exactly
what produced the preview — they cannot drift."*). The "MARKUP" tab under
each date-picker demo on `dates.html` is a deliberate, syntax-highlighted,
live-updating **code-sample viewer** — it reads `preview.innerHTML` and
assigns it via `code.textContent = codeText` (line ~556 of `docs-shell.js`,
explicitly commented `// textContent = safe, exact`) into a
`<pre class="docs-code ... language-markup">` box specifically so developers
can see the exact HTML a demo produces. Once my `wireTriggerIcon()` started
injecting a `<span class="fp-icon-slot">...<svg>...` wrapper, that new
markup correctly started showing up — as intended — in this pre-existing
"view source" panel, displayed as escaped, syntax-highlighted TEXT (which is
exactly what a code-sample box is supposed to do).

Confirmed live three ways:
- `document.querySelectorAll('.fp-icon-trigger svg')[0] instanceof SVGElement`
  → `true`, correct SVG namespace, `iconTextContentLength: 0` — the actual
  rendered icon element contains a real SVG node, no stray text.
- The only elements anywhere on the page containing literal `<line` text are
  `<pre class="docs-code wui-demo-pane ... language-markup">` boxes — i.e.
  exactly the deliberate code-sample panels, none elsewhere.
- Full-page screenshot (before this specific re-check) shows the calendar
  trigger icon rendering as a clean blue calendar glyph on every input field
  — visually correct, not raw text.

No code change was made for this — flagging it explicitly here rather than
silently dropping it, since the report was raised as urgent and specific.

## Live verification (claude-in-chrome, `docs/docs/dates.html` via local static server)

Bound a fresh port (18793) after confirming 8791/18791 were free via a port
scan, then re-confirmed mid-session that another concurrent session had
opened *unrelated* servers on `8934`/`8743`/`47821`/`8791`/`8843`/`8844`/
`39217`/`8973` in the SAME shared browser instance — the browser tab group is
shared across concurrent Claude sessions on this machine. Created a dedicated
new tab (rather than reusing the shared one) partway through to avoid
cross-session interference after two `javascript_tool` calls hit "Inspected
target navigated or closed" from another session driving the original tab.

- **Factory instance structure** (`fp-datetime`): custom month dropdown
  present, zero native `<select>`, hour input has `.wui-number` nested inside
  an unmodified `numInputWrapper`, **zero leftover `span.arrowUp`/
  `arrowDown`** (native build never creates them for time fields), year field
  has NO `.wui-number` and its `numInputWrapper` correctly carries
  `data-wui-no-number`.
- **Raw, non-factory `flatpickr()` call** (`flatpickr(rawInput, {enableTime:
  true, dateFormat:'Y-m-d H:i:S'})`, mimicking
  `webeoc-dynamic-list-filters.js`'s call shape exactly, zero factory
  involvement): **100% parity** — custom month dropdown present, zero native
  select, hour has `.wui-number`, trigger icon SVG present, year opted out of
  number-wrap. This is the actual proof the architecture closes the gap the
  pivot was about.
- **True wraparound** (the real behavioral upgrade over the old external
  approach): hour at 23, click up-stepper → wraps to `00` (not clamped at 23
  like native `stepUp()` would); bound text field updates to the new value
  **instantly** on click, not just on close.
- **Minute rollover into hour**: minute at 55, click up (step=5) → minute
  wraps to `00` AND hour increments 10→11, matching stock flatpickr's own
  cascading logic exactly (confirmed via `incrementNumInput()` calling the
  real `timeWrapper()`/`updateTime()` internals, not an approximation).
- **12-hour AM/PM flip**: hour at 11 AM, click up-stepper → hour becomes 12
  AND AM/PM flips to PM in the same click — real flatpickr noon-flip logic.
- **Seconds preset**: `.flatpickr-second` has `.wui-number`; stepping 55→00
  wraps correctly.
- **Keyboard**: typing directly into the hour field works (native text
  editing, unaffected by the fork); `ArrowUp`/`ArrowDown` on a focused field
  goes through flatpickr's own unmodified `onKeyDown` handler — confirmed
  10→11 on a single ArrowUp.
- **AM/PM toggle click** (`.flatpickr-am-pm`, untouched — not a
  `type="number"` field, out of scope per the original task, still not
  touched under the fork): AM→PM click toggle still works, bound field
  reflects it correctly.
- **Year field unaffected**: value renders in full ("2026", not "202"),
  `padding-inline-end: 0px` computed (not the 1.9rem `.wui-number` reservation
  — because it never gets wrapped into `.wui-number` at all), no
  `.wui-number-btns` present — still the plain, already-fixed native
  spinner/arrow look from the earlier session's Bug 1 fix.
- **Chevron overlap bug**: fixed and re-verified, see "Bugs found and fixed."
- **Theme toggle**: `WUI.setTheme('light'/'dark')` — the trigger icon's color
  re-computes live (`rgb(58,128,224)` dark → `rgb(24,95,165)` light,
  `var(--color-10)` cascading through `--fp-icon-color`), confirming the
  inline-SVG fix actually achieves its purpose (the old background-image
  could never do this). `.wui-number-step`'s own color stayed the same gray
  in both themes — pre-existing, unrelated to this fork (that's
  `var(--color-text-secondary)` in the ALREADY-SHIPPED shared `.wui-number`
  component, same in every other instance of it across the app).
- **RTL** (`WUI.i18n.setLang('ar')`): `document.documentElement` flips to
  `dir="rtl"`; the trigger icon correctly mirrors to the LEFT edge of the
  input (`inset-inline-end` resolving physically-left under RTL, confirmed
  via computed `left`/`right`); the calendar popup itself stays
  `direction: ltr` (pre-existing, unrelated vendor behavior — flatpickr
  hardcodes this, confirmed in an earlier session's work, not something this
  fork changes); month dropdown menu still opens/functions correctly in RTL.
  Screenshot confirms the whole page (sidebar, search bar, headings) flips to
  Arabic/RTL correctly with the calendar icon on the left of each input.
- **Console**: 0 real errors across the whole session (one unrelated
  `chrome-extension://.../content-script.js` log about "subsystem status",
  confirmed unrelated to this page/work).
- **Syntax**: `node --check` passes clean on `JS/flatpickr-weoc.js`,
  `JS/flatpickr.min.js`, and `JS/flatpickr-factory.js`.

## Concerns / known limitations

- **`showMonths>1` dynamic reconfiguration via `fp.set('showMonths', N)`**:
  `buildMonthDropdownMenu()`'s menus are appended to `self.calendarContainer`
  (not `self.monthNav`), but `fp.set('showMonths', ...)` triggers
  `buildMonths()` again, which `clearNode(self.monthNav)`s and rebuilds fresh
  triggers/menus — the OLD menu elements (appended to `calendarContainer`,
  untouched by that clear) would be orphaned rather than removed, leaking DOM
  on repeated reconfiguration. No preset or call site in this codebase
  actually does this today (`showMonths` defaults to 1 everywhere, grepped to
  confirm), so this is a real but currently-unreachable edge case — flagging
  rather than silently leaving it unmentioned, consistent with the earlier
  session's own "implemented and guarded but no live preset to exercise it"
  caveat for the same `showMonths>1` delta math.
- **`flatpickr-l10n-ar.js`** is still not loaded anywhere in the docs site
  (pre-existing gap from the earlier session, unrelated to and unchanged by
  this fork — wiring it in touches `docs-shell.js`'s script-loading logic,
  explicitly out of scope).
- **`fp-icon-slot` wrapper is not unwrapped on `fp.destroy()`** — no board or
  test in this codebase calls `.destroy()` on a flatpickr instance today, so
  this is untested/unreachable in practice, but worth flagging as a real gap
  if that ever changes.
- **Two vendor copies to keep in sync**: `JS/flatpickr.min.js` (what
  `docs-shell.js` actually loads) and the inline blob inside
  `JS/flatpickr-factory.js` (a fallback for consumers that load the factory
  standalone) are both regenerated from the same `JS/flatpickr-weoc.js`
  source via the same terser command — documented in both files' headers,
  but there is no build script automating the "regenerate both" step; a
  future edit to `flatpickr-weoc.js` that only re-minifies one of the two
  targets would silently desync them.
- **Maintenance cost**: any future flatpickr version bump requires manually
  re-diffing and reapplying these 5 changes against the new upstream source —
  documented explicitly in `flatpickr-weoc.js`'s own header, per the
  coordinator's instruction, since this is a real, permanent cost the user
  explicitly accepted by choosing the fork approach.
