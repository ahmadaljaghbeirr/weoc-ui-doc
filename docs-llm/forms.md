# Text Inputs & Fields

[← Index](README.md)

Input-view primitives from `weoc-forms.css`: the `form-control` input/textarea, the `wui-fieldset` group, the `field-row`/`field-item` grid, helper text, and the `wui-ftr-*` form footer. Every state and layout is shown below with its exact markup.

> **Add-on module — load weoc-forms.css on input views:** Forms are not in `weoc-ui-core.css`. Add `&lt;link rel="stylesheet" href="weoc-forms.css"&gt;` after the core barrel on input-style views. Checkboxes, radios, and card options live in `weoc-card-group.css` (see [Cards & Forms](./cards.md)); TomSelect and Flatpickr have their own pages.

## form-control

Base class for text inputs and textareas (`height: 2.5rem`, transparent background, bordered). Focus draws a primary ring. `textarea.form-control` auto-grows in height and is vertically resizable (`min-height: 90px`). Readonly and disabled states are documented in their own sections below.

### Text input — default & focus

```html
<!-- Placeholder -->
<input type="text" class="form-control" placeholder="Type here…">
<!-- With value -->
<input type="text" class="form-control" value="Incident at Terminal 3">
```

### Input types — form-control applies to all text-family inputs

`form-control` is type-agnostic: apply it to any single-line `<input>`. These render identically to a text field but keep their native keyboards and validation. Number fields get a themed stepper — see `wui-number` below.

```html
<!-- Email -->
<input type="email" class="form-control" placeholder="name@agency.gov">
<!-- Tel -->
<input type="tel" class="form-control" placeholder="+971 50 000 0000">
<!-- URL -->
<input type="url" class="form-control" placeholder="https://…">
<!-- Password -->
<input type="password" class="form-control" value="secret123">
<!-- Search -->
<input type="search" class="form-control" placeholder="Search records…">
```

### Textarea

```html
<!-- Empty textarea -->
<textarea class="form-control" placeholder="Brief description of the incident…"></textarea>
<!-- Textarea with value -->
<textarea class="form-control">Situation assessed at 08:00. No immediate life safety risk. Monitoring ongoing.</textarea>
```

## wui-number — themed stepper

Browsers render native `type="number"` spinners in their own chrome that cannot be recoloured to match the theme (WebKit exposes almost nothing; Firefox nothing). `wui-number` wraps the input, hides the native spinners, and adds token-driven `+`/`−` buttons that follow light and dark automatically. `weoc-ui.js` binds `data-wui-step` and steps the input with the native `stepUp()`/`stepDown()`, so `min`, `max`, and `step` are honoured and `input`/`change` events still fire. The input stays keyboard-steppable (arrow keys); the buttons are `tabindex="-1"` mouse aids. Requires `weoc-ui.js`.

### Default — with value, min / max / step

```html
<!-- Default (step 1, min 0, max 999) -->
<div class="wui-number">
  <input type="number" class="form-control" value="12" min="0" max="999" step="1">
  <div class="wui-number-btns" aria-hidden="true">
    <button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
    <button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
  </div>
</div>
<!-- Placeholder, no value -->
<div class="wui-number">
  <input type="number" class="form-control" placeholder="Casualty count" min="0">
  <div class="wui-number-btns" aria-hidden="true">
    <button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
    <button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
  </div>
</div>
<!-- Decimal step -->
<div class="wui-number">
  <input type="number" class="form-control" value="1.5" min="0" max="10" step="0.5">
  <div class="wui-number-btns" aria-hidden="true">
    <button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
    <button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
  </div>
</div>
```

### Readonly & disabled — stepper hidden, padding reclaimed

```html
<!-- Readonly -->
<div class="wui-number">
  <input type="number" class="form-control" value="42" readonly>
  <div class="wui-number-btns" aria-hidden="true">
    <button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
    <button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
  </div>
</div>
<!-- Disabled -->
<div class="wui-number">
  <input type="number" class="form-control" value="7" disabled>
  <div class="wui-number-btns" aria-hidden="true">
    <button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
    <button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
  </div>
</div>
```

## wui-fieldset

A titled section grouping field rows. `wui-fieldset-legend` (optional icon) sits at the top, an optional `wui-fieldset-sub` description tucks under it, and `wui-fieldset-body` holds the `field-row` groups. Works on a real `<fieldset>`/`<legend>` or plain divs. Add `plain` to drop the surface chrome (background, border, padding).

### Standard fieldset (legend + sub + body)

```html
<!-- Fieldset with legend, sub, and body -->
<fieldset class="wui-fieldset">
  <legend class="wui-fieldset-legend">
    <span class="material-symbols-outlined">person</span>
    Reporting Officer
  </legend>
  <p class="wui-fieldset-sub">Who is filing this incident report.</p>
  <div class="wui-fieldset-body">
    <div class="field-row">
      <div class="field-item">
        <label class="field-label">First name <span class="required">*</span></label>
        <input type="text" class="form-control" placeholder="Jordan">
      </div>
      <div class="field-item">
        <label class="field-label">Last name <span class="required">*</span></label>
        <input type="text" class="form-control" placeholder="Rivera">
      </div>
    </div>
    <div class="field-row full">
      <div class="field-item">
        <label class="field-label">Summary</label>
        <textarea class="form-control" placeholder="Brief description of the incident…"></textarea>
        <div class="field-hint">Max 500 characters.</div>
      </div>
    </div>
  </div>
</fieldset>
```

### Plain (no chrome)

```html
<!-- Plain fieldset — titled group with no surface -->
<fieldset class="wui-fieldset plain">
  <legend class="wui-fieldset-legend">
    <span class="material-symbols-outlined">tune</span>
    Filters
  </legend>
  <div class="field-row">
    <div class="field-item">
      <label class="field-label">Keyword</label>
      <input type="text" class="form-control" placeholder="Search text…">
    </div>
    <div class="field-item">
      <label class="field-label">Reference</label>
      <input type="text" class="form-control" placeholder="AUTO-0001">
    </div>
  </div>
</fieldset>
```

## Field grid — field-row / field-item

`field-row` is a CSS grid. By default it is 2 columns; add `full` for 1 column, `three` for 3, or `four` for 4. Each `field-item` is a vertical stack of `field-label` → control → optional `field-hint`. `field-label .required` renders a danger-colored asterisk. A label may carry a leading `material-symbols-outlined` icon (tinted primary).

### field-row — 2 columns (default)

```html
<!-- Two columns -->
<div class="field-row">
  <div class="field-item">
    <label class="field-label">First name</label>
    <input type="text" class="form-control" placeholder="Jordan">
  </div>
  <div class="field-item">
    <label class="field-label">Last name</label>
    <input type="text" class="form-control" placeholder="Rivera">
  </div>
</div>
```

### field-row full — 1 column

```html
<!-- Single full-width column -->
<div class="field-row full">
  <div class="field-item">
    <label class="field-label">Summary</label>
    <input type="text" class="form-control" placeholder="One field spanning the full width">
  </div>
</div>
```

### field-row three — 3 columns

```html
<!-- Three columns -->
<div class="field-row three">
  <div class="field-item">
    <label class="field-label">City</label>
    <input type="text" class="form-control" placeholder="City">
  </div>
  <div class="field-item">
    <label class="field-label">State</label>
    <input type="text" class="form-control" placeholder="State">
  </div>
  <div class="field-item">
    <label class="field-label">ZIP</label>
    <input type="text" class="form-control" placeholder="00000">
  </div>
</div>
```

### field-row four — 4 columns

```html
<!-- Four columns -->
<div class="field-row four">
  <div class="field-item">
    <label class="field-label">Day</label>
    <input type="text" class="form-control" placeholder="DD">
  </div>
  <div class="field-item">
    <label class="field-label">Month</label>
    <input type="text" class="form-control" placeholder="MM">
  </div>
  <div class="field-item">
    <label class="field-label">Year</label>
    <input type="text" class="form-control" placeholder="YYYY">
  </div>
  <div class="field-item">
    <label class="field-label">Zone</label>
    <input type="text" class="form-control" placeholder="UTC">
  </div>
</div>
```

### field-label — required marker & icon

```html
<!-- Required marker -->
<div class="field-row">
  <div class="field-item">
    <label class="field-label">Incident ID <span class="required">*</span></label>
    <input type="text" class="form-control" placeholder="AUTO-0001">
  </div>
  <!-- Label with leading icon -->
  <div class="field-item">
    <label class="field-label"><span class="material-symbols-outlined">location_on</span> Location</label>
    <input type="text" class="form-control" placeholder="Terminal 3">
  </div>
</div>
```

### field-hint — helper text

```html
<!-- Muted helper text below the control -->
<div class="field-item">
  <label class="field-label">Email</label>
  <input type="text" class="form-control" placeholder="name@agency.gov">
  <div class="field-hint">We only use this to send status updates.</div>
</div>
```

## Readonly fields

Use the native `[readonly]` attribute or the `.is-readonly` class on the control for fields that display existing data and must not be edited. Both selectors produce the same look: a dashed border and a muted secondary-light surface. The text stays copyable and the field is still focusable. Wrapping `field-item` in `is-readonly` also dims the label. (Readonly is not disabled — see the callout below.)

### [readonly] attribute vs .is-readonly class

```html
<!-- Native readonly attribute -->
<div class="field-item is-readonly">
  <label class="field-label">Created by</label>
  <input type="text" class="form-control" readonly value="J. Rivera (WebEOC)">
</div>
<!-- Class-only readonly (e.g. custom controls) -->
<div class="field-item is-readonly">
  <label class="field-label">Status</label>
  <input type="text" class="form-control is-readonly" value="Monitoring">
</div>
```

### Readonly textarea (resize disabled)

```html
<!-- Readonly textarea — resize handle removed -->
<div class="field-item is-readonly">
  <label class="field-label">Prior assessment</label>
  <textarea class="form-control" readonly>Situation assessed at 08:00. No immediate life safety risk. Monitoring ongoing.</textarea>
</div>
```

### Editable vs readonly — side by side

```html
<!-- Editable + readonly in one row -->
<div class="field-row">
  <div class="field-item">
    <label class="field-label">Editable field <span class="required">*</span></label>
    <input type="text" class="form-control" placeholder="Type here…">
    <div class="field-hint">Normal editable control.</div>
  </div>
  <div class="field-item is-readonly">
    <label class="field-label">Readonly field</label>
    <input type="text" class="form-control" readonly value="Computed by system">
    <div class="field-hint">Set by the system — not editable.</div>
  </div>
</div>
```

> **Readonly ≠ disabled:** Readonly fields are still focusable and the text is copyable. If the control must be completely inert (no tab stop, grayed out), use the `disabled` attribute instead (next section).

## Disabled fields

The native `disabled` attribute renders inert controls. `form-control` inherits the browser's default disabled treatment (reduced contrast, no focus, no tab stop). Use disabled when the field should not be interactive at all; use readonly when its value should still be selectable and copyable.

### Disabled input & textarea

```html
<!-- Disabled input -->
<input type="text" class="form-control" disabled value="Locked value">
<!-- Disabled empty input -->
<input type="text" class="form-control" disabled placeholder="Unavailable">
<!-- Disabled textarea -->
<textarea class="form-control" disabled>Disabled textarea content.</textarea>
```

## form-section

A carded surface with a titled header, used to break a long form into labelled blocks. `form-section-title` is an underlined heading with an optional leading icon (tinted primary). Similar to `wui-fieldset` but without a semantic `<legend>`; use it for lighter visual grouping.

### Titled section

```html
<!-- Carded section with underlined title -->
<div class="form-section">
  <div class="form-section-title">
    <span class="material-symbols-outlined">description</span>
    Incident Details
  </div>
  <div class="field-row">
    <div class="field-item">
      <label class="field-label">Title <span class="required">*</span></label>
      <input type="text" class="form-control" placeholder="Short incident title">
    </div>
    <div class="field-item">
      <label class="field-label">Reference</label>
      <input type="text" class="form-control" placeholder="AUTO-0001">
    </div>
  </div>
</div>
```

## wui-ftr-wrap — form footer

Sticky action bar for input views. `wui-ftr-wrap` → `wui-ftr-inner` → `wui-ftr-body` lays out a left meta zone (`wui-ftr-left` / `wui-ftr-meta`) and a right action zone (`wui-ftr-right` or `wui-ftr-actions`). `wui-ftr-meta` takes a status modifier (`primary` / `success` / `warning` / `danger`) that tints its icon, and `<strong>` inside it is emphasized. Add `centered` to the wrap for a max-width carded footer, or `actions-only` to the body when there is no meta zone so the buttons stay right-aligned.

### Default footer — meta status colors

```html
<!-- Success meta -->
<div class="wui-ftr-wrap">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body">
      <div class="wui-ftr-left">
        <div class="wui-ftr-meta success">
          <span class="material-symbols-outlined">check_circle</span>
          <strong>3 fields</strong> ready to submit
        </div>
      </div>
      <div class="wui-ftr-actions">
        <button type="button" class="wui-btn ghost secondary wui-btn-sm"><span class="material-symbols-outlined">close</span> Cancel</button>
        <button type="button" class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">save</span> Save</button>
      </div>
    </div>
  </div>
</div>
```

### Meta modifiers — primary / warning / danger

```html
<!-- Primary meta -->
<div class="wui-ftr-wrap">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body">
      <div class="wui-ftr-left">
        <div class="wui-ftr-meta primary">
          <span class="material-symbols-outlined">info</span>
          <strong>Draft</strong> autosaved a moment ago
        </div>
      </div>
      <div class="wui-ftr-right">
        <button type="button" class="wui-btn primary wui-btn-sm">Continue</button>
      </div>
    </div>
  </div>
</div>
<!-- Warning meta -->
<div class="wui-ftr-wrap">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body">
      <div class="wui-ftr-left">
        <div class="wui-ftr-meta warning">
          <span class="material-symbols-outlined">warning</span>
          <strong>1 field</strong> needs review
        </div>
      </div>
      <div class="wui-ftr-right">
        <button type="button" class="wui-btn warning wui-btn-sm">Review</button>
      </div>
    </div>
  </div>
</div>
<!-- Danger meta -->
<div class="wui-ftr-wrap">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body">
      <div class="wui-ftr-left">
        <div class="wui-ftr-meta danger">
          <span class="material-symbols-outlined">error</span>
          <strong>2 errors</strong> must be fixed
        </div>
      </div>
      <div class="wui-ftr-right">
        <button type="button" class="wui-btn danger wui-btn-sm">Fix</button>
      </div>
    </div>
  </div>
</div>
```

### Centered — carded footer

```html
<!-- Centered variant: transparent wrap, carded inner -->
<div class="wui-ftr-wrap centered">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body">
      <div class="wui-ftr-left">
        <div class="wui-ftr-meta">
          <span class="material-symbols-outlined">schedule</span>
          Last edited 2 minutes ago
        </div>
      </div>
      <div class="wui-ftr-actions">
        <button type="button" class="wui-btn ghost secondary wui-btn-sm">Cancel</button>
        <button type="button" class="wui-btn primary wui-btn-sm">Save</button>
      </div>
    </div>
  </div>
</div>
```

### Actions only — actions-only body (no meta)

```html
<!-- Buttons alone: actions-only keeps them right-aligned with no left meta zone -->
<div class="wui-ftr-wrap">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body actions-only">
      <div class="wui-ftr-actions">
        <button type="button" class="wui-btn ghost secondary wui-btn-sm">Cancel</button>
        <button type="button" class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">save</span> Save</button>
      </div>
    </div>
  </div>
</div>
<!-- Composes with centered for a carded, buttons-only footer -->
<div class="wui-ftr-wrap centered">
  <div class="wui-ftr-inner">
    <div class="wui-ftr-body actions-only">
      <div class="wui-ftr-actions">
        <button type="button" class="wui-btn ghost secondary wui-btn-sm">Discard</button>
        <button type="button" class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">send</span> Submit</button>
      </div>
    </div>
  </div>
</div>
```

## Date & Time (Flatpickr)

Date, time, datetime, and range pickers powered by `flatpickr-factory.js`. Add `data-fp-preset` to any `<input>` and the factory auto-inits it, styling it with `flatpickr-input` and the `flat-date` / `flat-time` / `flat-range-*` skins. Vendor CSS/JS are loaded globally by the docs shell.

### How the factory binds

The factory exposes the global `window.FlatpickrFactory` with `init(scope)`, `PRESETS`, and `FMT`. On load it calls `FlatpickrFactory.init()`, which runs `querySelectorAll('[data-fp-preset]')` over the scope and initializes every matching input (already-initialized inputs carry `_flatpickr` and are skipped). Every input dispatches a bubbling `fp:change` CustomEvent (`e.detail.dateStr`) on selection.

> **Re-init after SPA navigation:** These demos are initialized by this page's own `Alpine.data('formsPage', ...)` component (which calls `FlatpickrFactory.init()` from inside `window.DocShell.ready`), so they re-bind on every navigation to this page. The classes `flat-date` / `flat-time` / `flat-range-start` / `flat-range-end` are cosmetic only; binding is driven entirely by `data-fp-preset`.

## Date only

Calendar picker, no time. `date` renders ISO `Y-m-d`; `date-dmy` renders `d/m/Y`.

### date / date-dmy

```html
<!-- ISO date (Y-m-d) -->
<input id="fp-date" class="flatpickr-input flat-date" data-fp-preset="date" placeholder="YYYY-MM-DD">
<!-- DMY date (d/m/Y) -->
<input id="fp-date-dmy" class="flatpickr-input flat-date" data-fp-preset="date-dmy" placeholder="DD/MM/YYYY">
```

## Time only

`noCalendar` presets — the time spinner with no date. `time` is 24hr (`H:i`); `time-12` is 12hr with AM/PM (`h:i K`).

### time / time-12

```html
<!-- 24hr time -->
<input id="fp-time" class="flatpickr-input flat-time" data-fp-preset="time" placeholder="HH:MM">
<!-- 12hr time (AM/PM) -->
<input id="fp-time-12" class="flatpickr-input flat-time" data-fp-preset="time-12" placeholder="HH:MM AM/PM">
```

## Date + time

`enableTime` presets combining calendar and clock. Format and 12/24hr vary per preset; `datetime-seconds` adds a seconds spinner.

### datetime / datetime-dmy / datetime-12 / datetime-seconds

```html
<!-- Datetime 24hr (Y-m-d H:i) -->
<input id="fp-datetime" class="flatpickr-input flat-date" data-fp-preset="datetime" placeholder="YYYY-MM-DD HH:MM">
<!-- Datetime DMY 24hr (d/m/Y H:i) -->
<input id="fp-datetime-dmy" class="flatpickr-input flat-date" data-fp-preset="datetime-dmy" placeholder="DD/MM/YYYY HH:MM">
<!-- Datetime DMY 12hr (d/m/Y h:i K) -->
<input id="fp-datetime-12" class="flatpickr-input flat-date" data-fp-preset="datetime-12" placeholder="DD/MM/YYYY h:MM AM/PM">
<!-- Datetime + seconds (Y-m-d H:i:S) -->
<input id="fp-datetime-seconds" class="flatpickr-input flat-date" data-fp-preset="datetime-seconds" placeholder="YYYY-MM-DD HH:MM:SS">
```

## Future-only & past-only

Bounded presets that clamp the selectable range against *now*. The min/max is refreshed in an `onOpen` hook so the boundary stays accurate across a long-lived page. `past-datetime` also adds 12hr time + seconds.

### future-date / past-date

```html
<!-- Future date only (no past dates) -->
<input id="fp-future-date" class="flatpickr-input flat-date" data-fp-preset="future-date" placeholder="From today onward">
<!-- Past date only (no future dates) -->
<input id="fp-past-date" class="flatpickr-input flat-date" data-fp-preset="past-date" placeholder="Up to today">
```

### future-datetime / past-datetime

```html
<!-- Future date + 24hr time -->
<input id="fp-future-datetime" class="flatpickr-input flat-date" data-fp-preset="future-datetime" placeholder="From now onward">
<!-- Past date + 12hr time + seconds -->
<input id="fp-past-datetime" class="flatpickr-input flat-date" data-fp-preset="past-datetime" placeholder="Up to now">
```

## Date range (paired)

Two inputs that constrain each other: both share a `data-fp-range-group`, with `data-fp-range-role="start"` on one and `"end"` on the other. The start's selection becomes the end's minimum and vice-versa. Wrap the pair in `wui-date-range-wrap` for the tight flex row.

### range-start + range-end

```html
<div class="wui-date-range-wrap">
  <!-- Range start (Y-m-d H:i:S, 24hr) -->
  <input id="fp-range-start" class="flatpickr-input flat-range-start" data-fp-preset="range-start" data-fp-range-group="docs-window" data-fp-range-role="start" placeholder="Start">
  <span class="material-symbols-outlined">arrow_forward</span>
  <!-- Range end (Y-m-d H:i:S, 24hr) -->
  <input id="fp-range-end" class="flatpickr-input flat-range-end" data-fp-preset="range-end" data-fp-range-group="docs-window" data-fp-range-role="end" placeholder="End">
</div>
```

## Inline calendar

`data-fp-inline="true"` embeds the calendar permanently in place instead of opening a popup. Works with any preset; useful for date panels and dashboard filter widgets.

### date · inline

```html
<!-- Inline date calendar -->
<input id="fp-inline" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-inline="true">
```

## Per-input overrides

Any preset can be tuned inline with `data-fp-*` overrides: `data-fp-format` (a `Y-m-d` string or an alias like `dmy-hi`), `data-fp-min-date` / `data-fp-max-date`, `data-fp-enable-time`, `data-fp-24hr`, `data-fp-seconds`, `data-fp-allow-input`, `data-fp-week-numbers`, `data-fp-mode` (`single`/`multiple`/`range`), `data-fp-position`, `data-fp-default-date`, and `data-fp-on-change` (name of a global handler).

### Override examples

```html
<!-- Manual text entry + week numbers -->
<input id="fp-ov-input" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-allow-input="true" data-fp-week-numbers="true" placeholder="Type or pick">
<!-- Bounded window via min/max -->
<input id="fp-ov-bounds" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-min-date="2026-01-01" data-fp-max-date="2026-12-31" placeholder="2026 only">
<!-- Native multi-select mode -->
<input id="fp-ov-multiple" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-mode="multiple" placeholder="Pick several dates">
<!-- Format alias override (dmy-hi = d/m/Y H:i) -->
<input id="fp-ov-format" class="flatpickr-input flat-date" data-fp-preset="datetime" data-fp-format="dmy-hi" placeholder="DD/MM/YYYY HH:MM">
```

## Readonly display

Flatpickr always sets `[readonly]` internally. For a true display-only field, add `.is-readonly` to the input and disable opening with `fp.set('clickOpens', false)`. The dashed border and muted surface match the form-control readonly language.

### Editable vs readonly

```html
<!-- Editable date -->
<input id="fp-editable" class="flatpickr-input flat-date" data-fp-preset="date" placeholder="YYYY-MM-DD">
<!-- Readonly display date -->
<input id="fp-readonly" class="flatpickr-input flat-date is-readonly" data-fp-preset="date" data-fp-default-date="2026-06-24">
```

## Select / Combobox (TomSelect)

The `tom-select-factory.js` combobox. Add `class="tomselect"` to any `<select>`, drive every behavior through `data-*` attributes, and call `TomSelectFactory.init()`. The factory injects a blank placeholder option, resyncs dependent cascades, mounts pinned dropdown header/footer slots, and follows the agency theme. Every capability is demoed below with the exact markup and the exact init call.

### How it initializes

The factory binds every `<select class="tomselect">` in scope. Call `TomSelectFactory.init()` once after the DOM is ready. It also starts a `MutationObserver`, so late-injected selects (WebEOC repeat regions, modals) initialize automatically. Retrieve a live instance with `TomSelectFactory.get('idOrName')`; drive it with `refresh`, `destroy`, `enable`, `disable`.

> **Load order:** `tom-select.min.css` → `tom-select-agency.css` in `&lt;head&gt;`, then `tom-select.complete.min.js` → `tom-select-factory.js`. On this docs site the vendor CSS/JS is loaded site-wide by the shell; you only call `TomSelectFactory.init()`.

> **Instance key:** The key is the select's `id`, or its `name` if there is no id (an auto `data-ts-key` is stamped only when both are absent). Use that key with `TomSelectFactory.get()` / `enable()` / `disable()` / `destroy()` / `refresh()`.

## Single select

One item, with a built-in dropdown search field (`dropdown_input` plugin). The factory injects a blank placeholder option, so a fresh record shows the placeholder rather than auto-selecting the first real option. `data-placeholder` sets the placeholder text.

### Basic single (required — placeholder only)

Without `data-allow-empty`, the placeholder shows on load but the user cannot re-select blank once a value is chosen. This is the correct pattern for required fields.

```html
<!-- Single select, required — placeholder shows on load, no re-clear -->
<select id="cb-single" class="tomselect" data-placeholder="Select priority…">
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
  <option value="critical">Critical</option>
</select>
```

### Clearable single (data-allow-empty)

`data-allow-empty="true"` keeps the empty option selectable in the dropdown, so the user can actively re-clear the field. The clear-all "×" also appears once a value is chosen.

```html
<!-- Clearable single — user can re-select blank from the dropdown -->
<select id="cb-clearable" class="tomselect" data-allow-empty="true" data-placeholder="Optional — can clear…">
  <option value="active">Active</option>
  <option value="monitoring">Monitoring</option>
  <option value="resolved">Resolved</option>
</select>
```

### Preselected value (edit mode)

An `<option selected>` carrying the native `selected` attribute is honored — the factory only force-clears when no option has an explicit `selected` attribute (a browser default), so saved records repopulate correctly.

```html
<!-- Preselected — the explicit `selected` attribute survives placeholder injection -->
<select id="cb-preselected" class="tomselect" data-allow-empty="true" data-placeholder="Select severity…">
  <option value="sev1">Severity 1 — Catastrophic</option>
  <option value="sev2" selected>Severity 2 — Critical</option>
  <option value="sev3">Severity 3 — Moderate</option>
</select>
```

## Multi-select

Add `multiple` (or `data-multi="true"`). Selections render as removable chips (the `remove_button` plugin adds a per-chip "×"), and an inline search field is always visible. The right-rail plus icon replaces the chevron. In a WebEOC edit view, restore comma-separated values with `repopulateMultiSelect('FieldName', xslValue)` — WebEOC does not restore multi-select natively.

### Multiple (chips + remove)

```html
<!-- Multi-select — chips with per-chip remove, always-on search -->
<select id="cb-multi" class="tomselect" multiple data-placeholder="Select agencies…">
  <option value="fire">Fire Department</option>
  <option value="police">Police</option>
  <option value="ems">EMS</option>
  <option value="eoc">EOC</option>
  <option value="public-works">Public Works</option>
  <option value="utilities">Utilities</option>
</select>
```

### data-multi="true" (attribute form)

`data-multi="true"` is equivalent to the native `multiple` attribute. Useful when the markup is generated by a system that will not emit a bare boolean attribute.

```html
<!-- Multi via data-multi (no native `multiple` attribute) -->
<select id="cb-multi-attr" class="tomselect" data-multi="true" data-placeholder="Select resources…">
  <option value="truck">Fire Truck</option>
  <option value="ambulance">Ambulance</option>
  <option value="helicopter">Helicopter</option>
  <option value="boat">Rescue Boat</option>
</select>
```

### Multi with preselected chips (edit mode)

Options carrying `selected` render as chips on load. For WebEOC, the page-level `repopulateMultiSelect` helper splits the saved comma-separated string, sets the native value, then calls `.sync()`.

```html
<!-- Two options preselected — render as chips on init -->
<select id="cb-multi-preselected" class="tomselect" multiple data-placeholder="Select agencies…">
  <option value="fire" selected>Fire Department</option>
  <option value="ems" selected>EMS</option>
  <option value="police">Police</option>
  <option value="eoc">EOC</option>
</select>
```

## Creatable / tags

`data-create="true"` lets the user type a new value and add it with Enter or Tab. The factory also enables `createOnBlur`, so tabbing away commits the typed entry automatically. Works on both single and multi selects; multi is the common "tags" pattern.

### Creatable multi (tags)

```html
<!-- Creatable tags — type + Enter/Tab to add a new value -->
<select id="cb-tags" class="tomselect" multiple data-create="true" data-placeholder="Type to add tags…">
  <option value="urgent">Urgent</option>
  <option value="life-safety">Life Safety</option>
  <option value="infrastructure">Infrastructure</option>
  <option value="comms">Communications</option>
</select>
```

### Creatable single

The same `data-create` flag on a single select lets the user commit one free-text value that is not in the option list.

```html
<!-- Creatable single — accepts one free-text value -->
<select id="cb-create-single" class="tomselect" data-create="true" data-allow-empty="true" data-placeholder="Pick or type a location…">
  <option value="eoc">EOC</option>
  <option value="field">Field Command Post</option>
  <option value="staging">Staging Area</option>
</select>
```

## Remote / autocomplete (data-src="api")

`data-src="api"` turns the control into a remote autocomplete. The factory fetches `data-url?<data-url-param>=<query>` and maps each row through `data-value-field` / `data-label-field`. `data-preload="true"` loads once immediately; `data-preload="focus"` loads on first focus; omit to load only on keystroke. Placeholder injection and force-clear are skipped for API selects (options arrive asynchronously).

> **Live endpoint required:** This demo points at a placeholder `data-url`. With no reachable endpoint the control renders and searches, but returns no rows. Point `data-url` at a real JSON endpoint that echoes an array of `{ id, text }` objects to see results.

### Remote search — load on keystroke

```html
<!-- Remote autocomplete — fetches /api/users?q=<query>, maps id/text -->
<select id="cb-remote" class="tomselect"
        data-src="api"
        data-url="/api/users"
        data-url-param="q"
        data-value-field="id"
        data-label-field="text"
        data-placeholder="Search users…"></select>
```

### Remote — preload on focus

`data-preload="focus"` fetches the initial result set the first time the control is focused, so an empty query already shows options.

```html
<!-- Remote autocomplete — preload on first focus -->
<select id="cb-remote-preload" class="tomselect"
        data-src="api"
        data-url="/api/facilities"
        data-url-param="term"
        data-value-field="id"
        data-label-field="name"
        data-preload="focus"
        data-placeholder="Search facilities…"></select>
```

## Optgroups

Native `<optgroup label="…">` elements are honored — Tom Select renders each group with a pinned `optgroup-header`. Works with single and multi. No extra attributes are needed.

```html
<!-- Optgroups — native <optgroup> renders grouped headers -->
<select id="cb-optgroups" class="tomselect" data-allow-empty="true" data-placeholder="Assign to unit…">
  <optgroup label="Command">
    <option value="ic">Incident Commander</option>
    <option value="deputy">Deputy IC</option>
  </optgroup>
  <optgroup label="Operations">
    <option value="ops-chief">Operations Chief</option>
    <option value="staging">Staging Manager</option>
  </optgroup>
  <optgroup label="Logistics">
    <option value="log-chief">Logistics Chief</option>
    <option value="supply">Supply Unit</option>
  </optgroup>
</select>
```

## Custom option / item renderers

Register a render template with `TomSelectFactory.registerTemplate(name, def)` **before** `init()`, then point a select at it with `data-render="name"`. Tom Select copies every `data-*` attribute from each `<option>` into the option data object, so the template can render rich rows. Supported keys: `option`, `item`, `option_create`, `no_results`, `not_loading`, `optgroup`, `optgroup_header`, `loading`, `dropdown`. The agency CSS ships `.ts-person-option` / `.ts-person-name` / `.ts-person-meta` for this pattern.

```html
<!-- Custom renderer — two-line person rows from data-* on each option -->
<select id="cb-person" class="tomselect" data-allow-empty="true" data-placeholder="Assign officer…" data-render="DocsPersonTmpl">
  <option value="jr" data-role="Incident Commander" data-dept="EOC">J. Rivera</option>
  <option value="am" data-role="Operations Chief" data-dept="Fire">A. Martinez</option>
  <option value="tp" data-role="Logistics Chief" data-dept="EOC">T. Park</option>
  <option value="sb" data-role="Safety Officer" data-dept="EMS">S. Brown</option>
</select>
```

## Dependent / cascading selects

Two wiring styles. In WebEOC the board engine swaps the child's `<option>` list when the parent changes — mark the child with `data-parent="ParentName"` (or `parent="…"`) and the factory rebuilds the child from the currently visible native options. Outside WebEOC, wire `data-on-change="GlobalFn"` on the parent to a function that rebuilds the child options and calls `TomSelectFactory.get('child').clearOptions()` then `.sync()`. The live demo below uses the `data-on-change` style.

```html
<!-- Parent — fires data-on-change (window.docsFilterChild) with the value -->
<select id="cb-parent" name="cb-category" class="tomselect" data-allow-empty="true" data-placeholder="Select category…" data-on-change="docsFilterChild">
  <option value="hazmat">Hazmat</option>
  <option value="fire">Fire</option>
  <option value="flood">Flood</option>
</select>
<!-- Child — data-parent triggers auto-resync under WebEOC; here it is rebuilt by the handler -->
<select id="cb-child" name="cb-subcategory" class="tomselect" data-parent="cb-category" data-allow-empty="true" data-placeholder="Select category first…"></select>
```

## Dropdown slots (header / footer)

Mount arbitrary markup as a pinned header and/or footer inside the dropdown. Stage a hidden `<div class="ts-dropdown-slot">` in the page and point the select at it with `data-dropdown-header="#id"` / `data-dropdown-footer="#id"`. The factory *moves* the node (not a clone, so ids stay unique) into the dropdown and shields it from Tom Select's select/close handlers, so controls inside the slot stay interactive. Pair with `data-stay-open="true"` so picking an option does not close the dropdown while the user is also using the slot controls. Slots are also mountable manually via `TomSelectFactory.mountDropdownSlots(ts, el)`.

> **Mount once:** The slot node is consumed into the dropdown, so a select that is destroyed and re-initialized loses its slot. Mount already-initialized controls.

### Header slot + footer slot (stay-open)

```html
<!-- Select with a pinned dropdown header + footer; stays open on select -->
<select id="cb-slots" class="tomselect"
        data-allow-empty="true"
        data-stay-open="true"
        data-dropdown-header="#cb-slot-head"
        data-dropdown-footer="#cb-slot-foot"
        data-placeholder="Pick field, then sort…">
  <option value="created">Date created</option>
  <option value="updated">Date updated</option>
  <option value="priority">Priority</option>
  <option value="status">Status</option>
</select>
<!-- Staged header slot (hidden by .ts-dropdown-slot until mounted) -->
<div id="cb-slot-head" class="ts-dropdown-slot">
  <div class="field-label" style="margin:0 0 var(--space-1)">Sort direction</div>
  <div class="wui-check-group is-row">
    <label class="wui-radio sm"><input type="radio" name="cb-sort-dir" value="asc" checked><span class="wui-control-box"></span><span class="wui-control-label">Ascending</span></label>
    <label class="wui-radio sm"><input type="radio" name="cb-sort-dir" value="desc"><span class="wui-control-box"></span><span class="wui-control-label">Descending</span></label>
  </div>
</div>
<!-- Staged footer slot -->
<div id="cb-slot-foot" class="ts-dropdown-slot">
  <button type="button" class="wui-btn ghost primary wui-btn-sm block">Manage sort presets</button>
</div>
```

## Change callback (data-on-change)

`data-on-change="GlobalFn"` calls `window.GlobalFn(value, key, instance)` on every change — the value, the instance key, and the live Tom Select instance. Use it to drive dependent UI without touching the factory internals.

```html
<!-- On-change callback writes the picked value into the readout below -->
<select id="cb-onchange" class="tomselect" data-allow-empty="true" data-placeholder="Set incident level…" data-on-change="docsLevelChange">
  <option value="1">Level 1 — Full activation</option>
  <option value="2">Level 2 — Partial activation</option>
  <option value="3">Level 3 — Monitoring</option>
</select>
<div class="field-hint">Selected level: <strong id="cb-onchange-out">none</strong></div>
```

## Dropdown parent (data-dropdown-parent)

The dropdown teleports to `<body>` by default so it is never clipped by an `overflow:hidden` ancestor. Override the mount target with `data-dropdown-parent="<selector>"` when the dropdown must live inside a specific scroll container or modal.

```html
<!-- Dropdown mounted to <body> (default) — stated explicitly for clarity -->
<select id="cb-dropdown-parent" class="tomselect" data-allow-empty="true" data-dropdown-parent="body" data-placeholder="Select zone…">
  <option value="north">North Zone</option>
  <option value="south">South Zone</option>
  <option value="east">East Zone</option>
  <option value="west">West Zone</option>
</select>
```

## States — disabled & readonly

Disabled (native `disabled` attribute, or `TomSelectFactory.disable('key')`) renders at reduced opacity, fully inert with no tab stop. Readonly (add `.is-readonly` to the `.ts-wrapper` after init) matches the form-control readonly style: dashed border, muted surface, text still selectable and copyable, and no dropdown opens.

```html
<!-- Disabled — native attribute; inert, no tab stop -->
<select id="cb-disabled" class="tomselect" disabled>
  <option value="active" selected>Active Monitoring</option>
</select>
<!-- Readonly — .is-readonly added to the wrapper by this page's Alpine component after init -->
<select id="cb-readonly" class="tomselect">
  <option value="monitoring" selected>Monitoring</option>
</select>
```
