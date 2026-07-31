# Flatpickr theming fixes + custom month dropdown

Branch: `bao-weoc-ui-updates` (worktree). Files touched:
- `CSS/flatpickr-agency.css`
- `JS/flatpickr-factory.js`

No changes to `docs-shell.js`, `flatpickr.min.js`, or `flatpickr.min.css` (vendored/off-limits, per constraints).

## Bug 1 — year truncation ("202" instead of "2026")

**Root cause:** NOT a gap in `flatpickr-agency.css`. `weoc-ui.js`'s global `WUI.enhanceNumbers()`
(`build/src/interaction/number.js`) auto-wraps **every** `<input type="number">` on the page into a
themed `.wui-number` stepper (a `MutationObserver` catches inputs added after boot). Flatpickr's own
`input.cur-year` is `type="number"`, so as soon as a calendar popup got inserted into the DOM, the
observer wrapped it too. `weoc-forms.css`'s `.wui-number input[type="number"]` rule applies
`padding-inline-end: 1.9rem !important` (reserved for the wrapper's own +/- buttons), which ate the
year input's content box down to ~28px at the calendar's 18.9px font-size — not enough room for 4
digits, hence "202…" clipping. Confirmed live via `getComputedStyle` + `styleSheets` rule matching
before touching anything: the DOM chain was `input.cur-year → DIV.wui-number → DIV.numInputWrapper → …`,
i.e. a `.wui-number` div had been auto-inserted around it.

**Fix:** `number.js` already ships an opt-out: any input under a `[data-wui-no-number]` ancestor is
skipped by `wuiNumberSkip()`. `flatpickr-factory.js` now tags `fp.calendarContainer` with
`data-wui-no-number` in a shared `onReady` hook (`suppressNumberWrap()`, wired via `wrapHook()` so it
composes with any preset's existing hooks), applied to **every** instance the factory creates. This
also fully fixes the identical pollution on the hour/minute/second inputs (Bug 2).

`CSS/flatpickr-agency.css` additions (defensive/independent of the JS fix):
- `.flatpickr-current-month input.cur-year:focus { box-shadow: var(--fp-focus-ring); }`
- `.flatpickr-current-month input.cur-year[disabled]` — was hardcoded `rgba(0,0,0,0.5)` (invisible on
  dark), now `var(--fp-disabled-color)`.

## Bug 2 — time picker theming gaps

Root cause was **primarily the same `.wui-number` auto-wrap** as Bug 1 (hour/minute/second are also
`type="number"`) — fixed by the same `data-wui-no-number` tag. Beyond that, cross-checked every
vendor time-related selector in `flatpickr.min.css` against `flatpickr-agency.css` and found real,
independent gaps (vendor hardcodes light-theme-only colors that were never overridden):

- `.numInputWrapper span` (the spin-arrow box for year/hour/minute/second) — vendor hardcodes
  `border: 1px solid rgba(57,57,57,.15)`, a near-invisible/wrong-toned line on a dark calendar. Now
  `border-color: var(--fp-calendar-border)`.
- `.numInputWrapper span:hover` / `:active` — vendor hardcodes `rgba(0,0,0,.1)` / `rgba(0,0,0,.2)`
  (invisible on dark). Now `var(--fp-num-input-hover-bg)` / `var(--color-10-muted)`.
- `.flatpickr-time input:focus` / `.flatpickr-am-pm:focus` — vendor explicitly kills the outline
  (`outline:0;border:0`) with **no themed replacement**, so keyboard users tabbing through
  hour/minute/second/AM-PM had zero focus indicator. Added `box-shadow: var(--fp-focus-ring)`.

All background/hover/border colors for `.flatpickr-time`, `.flatpickr-hour/-minute/-second`,
`.flatpickr-am-pm`, and the `:` separator were already correctly themed in the existing file — no
regressions found there.

## Bug 3 — custom month dropdown (main ask)

**Investigated the real generated DOM first** (`flatpickr.min.js`'s `$()`/`q()`/`Ce()` functions)
rather than guessing: with the default `monthSelectorType: 'dropdown'` + `showMonths: 1`, flatpickr
builds a real `<select class="flatpickr-monthDropdown-months">` — a native OS listbox, confirmed
unstyleable, per the user's own prior attempt. Setting `monthSelectorType: 'static'` makes flatpickr
build a plain `<span class="cur-month">` instead (used internally for `showMonths > 1`, so it's a
first-class, fully-supported vendor code path — not a hack), with **zero click handler**, which is
exactly the clean hook point needed.

**Implementation** (`JS/flatpickr-factory.js`):
1. `initAll()` now defaults every instance's config to `monthSelectorType: 'static'` (a preset can
   still opt back into the native `<select>` by setting `monthSelectorType: 'dropdown'` itself —
   defensive escape hatch, unused today).
2. A shared `onReady` hook (`wireDatePicker` → `buildMonthDropdowns()`) runs once per instance:
   - Iterates `fp.monthElements` (flatpickr's own persistent node array — same nodes reused across
     `changeMonth()` redraws, so wiring once in `onReady` is sufficient, no per-render rebinding).
   - Turns each `<span class="cur-month">` into a `.fp-month-trigger` (`tabindex`, `role="button"`,
     `aria-haspopup`, `aria-expanded`, `data-wui-toggle="#<uid>"`).
   - Builds a `<div class="wui-dropdown fp-month-menu" data-wui-open-class="show"
     data-wui-anchor="bottom-start" data-wui-dismiss>` — **reusing the exact `.wui-dropdown` /
     `.wui-dropdown-item` markup + CSS from `weoc-overlays.css`** (same classes the docs'
     `overlays.html` dropdown demo uses), appended as a child of `fp.calendarContainer`.
   - 12 `<button class="wui-dropdown-item">`, one per month, labelled from
     `fp.l10n.months[shorthand ? 'shorthand' : 'longhand']` — **never hardcoded English**.
   - Selection calls `fp.changeMonth(target - colIndex - fp.currentMonth, true)` (delta form, so it's
     correct even under `showMonths > 1` where `monthElements[n]` represents `currentMonth + n`).
   - Everything else (open/close, outside-click, Escape, `aria-expanded` sync) is **not custom code**
     — it's the existing global `[data-wui-toggle]` / `[data-wui-dismiss]` delegated handlers in
     `overlays.js` (`WUI.open/close/toggle`), the same mechanism every other dropdown/popover/modal in
     this library already uses. `WUI.anchor()` (used internally by `WUI.open`) sets `position:fixed`,
     which sidesteps `.flatpickr-months`'/`.flatpickr-innerContainer`'s `overflow:hidden` entirely —
     confirmed this was the one part of the vendor DOM structure that could have been a blocker, and
     it isn't.
   - "Current month" is highlighted via a `wui:open` listener that toggles the existing
     `.wui-dropdown-item.primary` variant class (already fully token-driven, zero new color rules) plus
     `aria-selected`.
3. Added `data-fp-locale` to `readOverrides()` (maps to flatpickr's `locale` config) so a board can
   opt an input into `flatpickr-l10n-ar.js` per-input — previously there was no override for this at
   all.

**CSS** (`CSS/flatpickr-agency.css`, all token-driven, zero hardcoded colors):
```css
.flatpickr-current-month span.cur-month { cursor: pointer; border-radius: var(--radius-sm); padding: 0 var(--space-1); }
.flatpickr-current-month span.cur-month:hover,
.flatpickr-current-month span.cur-month[aria-expanded="true"] { background: var(--fp-dropdown-hover-bg); }
.flatpickr-current-month span.cur-month:focus { outline: none; box-shadow: var(--fp-focus-ring); }
.fp-month-menu { min-width: 140px; max-height: 264px; overflow-y: auto; }
.fp-month-menu .wui-dropdown-item.primary { background: var(--color-10-light); }
```

### Trigger design refinement (post-review)

Initial pass left "July" (bold, from vendor's own `span.cur-month{font-weight:700}`) and "2026"
(light, from vendor's own `input.cur-year{font-weight:300}`) reading as two mismatched fragments,
with no visual cue that the month was clickable. Fixed both:

- `.flatpickr-current-month` is now `display:inline-flex;align-items:center;justify-content:center;
  gap:var(--space-1)` instead of vendor's inline-block flow, so month + year sit as one evenly-spaced,
  vertically-centered unit (vendor's absolute-positioned centering band around the whole header is
  untouched — only the internal child layout changed).
- Both `span.cur-month` and `input.cur-year` are now `font-weight: 600` — one consistent weight
  instead of vendor's bold-vs-light split.
- Added a chevron using the library's **existing** `expand_more` + `rotate(180deg)`-on-open
  convention (same one `.wui-collapsible-chevron` in `weoc-containers.css` and `.wui-log-expand` in
  `weoc-tables.css` already use) — not invented from scratch. Key structural note: flatpickr
  overwrites `span.cur-month.textContent` on every month/year redraw (`Ce()` in the vendor bundle),
  which would silently delete a chevron nested *inside* that span. `buildMonthDropdowns()` now inserts
  a sibling `<span class="fp-month-trigger-wrap">` around the original `cur-month` span, appends the
  chevron next to it (not inside it), and moves all the interactive attributes
  (`data-wui-toggle`, `role`, `tabindex`, `aria-*`) from the span onto the wrapper — the span itself
  is now purely a text label vendor JS can keep rewriting safely. Rotation is keyed off
  `[aria-expanded="true"]` on the wrapper (which `WUI.open`/`WUI.close` already maintain) rather than
  an `.is-open` ancestor class, since the *panel* — not the trigger — carries that class here.
- Re-verified live: `.fp-month-trigger-wrap`/`.fp-month-chevron` present with no native `<select>`
  across all 21 `[data-fp-preset]` instances (zero failures, zero console errors); chevron transform
  confirmed `matrix(-1,0,0,-1,0,0)` (180°, pointing up) while open and reverts on close; selecting a
  month (tested via "November") still calls `changeMonth()` correctly and closes the menu.
- **Spacing follow-up:** the trigger and year chip initially read as cramped (text touching the
  hover-box edges). `.fp-month-trigger-wrap` padding went from `0 var(--space-1)` to
  `var(--space-1) var(--space-2)` (gap `var(--space-1)` instead of a bare `2px`), and
  `.flatpickr-current-month .numInputWrapper` (the year's box, previously `padding:0`) now gets the
  same `var(--space-1) var(--space-2)` + `border-radius: var(--radius-sm)` so month and year read as
  two evenly-padded, visually paired chips rather than one padded control next to one flush one.

### Before / after

- **Before:** clicking the month name opened a real `<select>`; the browser rendered its own native
  OS dropdown listbox — unstyleable browser chrome, confirmed by the user's own prior attempt.
- **After:** clicking the month name (still the same `<span>`, no layout shift) opens a
  `.wui-dropdown` panel matching the calendar's own dark/light surface, border, radius, and shadow;
  hovering an item shows the accent-tinted hover state; the current month shows a persistent
  accent-tinted "selected" background; selecting a month calls flatpickr's own `changeMonth()` and the
  grid updates live; Escape / outside-click / re-selecting all close it.

## Live verification (claude-in-chrome, `docs/docs/dates.html` via local static server)

Note: needed to bind a fresh Python server on a scratch port — port 8791 (the port used in the task
brief) turned out to already be occupied by a stale server from an unrelated worktree/session (its
`kanban.html`/etc. were showing under that port in other open tabs), so the browser was silently
testing against someone else's checkout until this was caught via a byte-count mismatch between the
local file and the `curl` response. Re-bound to port **18791** for all real verification below.

- **Year truncation:** `input.cur-year` computed `padding` went from `0 30.4px 0 5.292px` to
  `0 0 0 5.292px`; visually confirmed "July 2026" renders in full, no clipping.
- **`data-wui-no-number` / no `.wui-number` leak:** scripted a full sweep of all 21
  `[data-fp-preset]` instances on the page (every preset, the range pair, inline, all override demos,
  the readonly demo) — every one has `calendarContainer[data-wui-no-number]` and zero
  `.wui-number` elements inside its calendar. Zero console errors across the sweep.
- **Time picker:** opened `fp-datetime`, hovered the hour spinner — themed accent hover background,
  visible spin arrows, no stray light-gray border. Disabled-year case (`fp-ov-bounds`, min/max both
  2026) renders the year in muted `--color-text-secondary` gray, not vendor's invisible black-on-dark.
- **Custom month dropdown:** opened `fp-datetime`'s calendar, clicked "July" — themed dark panel
  opened, listed Jan–Dec, current month highlighted; clicked "March" — panel closed, calendar
  re-rendered to **March 2026** live (confirmed via screenshot + DOM). Escape closes it
  (`menu.classList.contains('is-open') === false` after `Escape`); outside-click closes it too.
- **Theme toggle:** called `WUI.setTheme('light')` mid-session with the month dropdown open — the
  entire calendar **and** the custom dropdown re-themed instantly to light colors with zero JS
  involvement on my part (pure CSS custom-property cascade off `[data-theme]`, same mechanism as
  every other themed component in this library). Confirms flatpickr popups are *not* the
  destroy/recreate-per-open case here — no `wui:themechange` listener was needed or added.
- **noCalendar guard:** `fp-time` / `fp-time-12` (time-only presets) correctly have no month row and
  `buildMonthDropdowns()` no-ops on them (`fp.monthElements` empty) — no crash, no dead menu in the DOM.
- **Arabic locale:** `flatpickr-l10n-ar.js` is **not currently loaded anywhere in the docs site**
  (grepped `docs-shell.js` and every `docs/docs/*.html` — confirmed absent; this predates my changes
  and is unrelated to the 3 bugs). To verify the custom dropdown's locale plumbing is correct anyway,
  loaded `flatpickr-l10n-ar.js` via a scratch `<script>` tag (not a permanent site change) and spun up
  a throwaway `flatpickr({locale:'ar', monthSelectorType:'static', ...})` instance in-console: the
  trigger showed "يوليو" and the dropdown listed "يناير، فبراير، مارس…" — confirms `buildMonthDropdowns()`
  correctly sources labels from `fp.l10n.months` with zero hardcoded English, for whatever locale an
  instance is configured with. Added `data-fp-locale` to the factory's `readOverrides()` so a board can
  actually reach this without console hacks (previously there was no way to set flatpickr's `locale` at
  all through the factory).

## RTL notes

flatpickr's vendor CSS hardcodes `.flatpickr-calendar { direction: ltr; }` **always** — the calendar
grid itself never flips for Arabic; this is pre-existing, vendor behavior, unrelated to this task. The
custom month-dropdown panel inherits that same forced `direction: ltr` from its parent
`calendarContainer`, which is the *correct* and consistent choice — it matches the rest of the
always-LTR calendar rather than introducing a half-flipped panel inside an LTR shell. `WUI.anchor()`'s
RTL detection reads the panel's own computed `direction`, so this resolves correctly with no special
casing needed.

## Concerns

- **Port collision during testing** (see above) — not a code issue, but worth flagging: another
  worktree/session's static server was squatting on port 8791 and silently served stale content
  through several of my early verification calls before I caught the byte-count mismatch and switched
  ports. All verification claims in this report are from the re-verified pass on port 18791.
- `flatpickr-l10n-ar.js` being unreachable from the docs site is a **pre-existing gap**, not something
  introduced or fixed here. Wiring it in would touch `docs-shell.js`'s script-loading logic, which is
  explicitly out of scope for this task — flagging it rather than silently leaving it unmentioned.
- The custom dropdown's multi-column (`showMonths > 1`) math (`target - colIndex - fp.currentMonth`)
  is implemented and guarded but has no live preset to exercise it against in this repo today — logic
  was verified by hand-tracing flatpickr's own `changeMonth()` delta semantics, not by a live
  showMonths>1 demo.
- `JS/flatpickr-factory.js` carries a header comment saying edits belong in a separate
  `_build-src/flatpickr-factory.js` regenerated via `build-bundles.ps1` — neither file exists anywhere
  in this repo checkout (confirmed via search), so this generated file is, in practice, the only copy
  and was edited directly. If that build pipeline exists in another repo/machine, the factory section
  (between `/* === BEGIN factory: flatpickr-factory.js === */` and `/* === END factory === */`) should
  be back-ported there.
