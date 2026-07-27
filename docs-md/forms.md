# Text Inputs & Fields

[← Index](README.md)

Input-view primitives from `weoc-forms.css`: the `form-control` input/textarea, the `wui-fieldset` group, the `field-row`/`field-item` grid, helper text, and the `wui-ftr-*` form footer. Every state and layout is shown below with its exact markup.

> **Add-on module — load weoc-forms.css on input views:** Forms are not in `weoc-ui-core.css`. Add `<link rel="stylesheet" href="weoc-forms.css">` after the core barrel on input-style views. Checkboxes, radios, and card options live in `weoc-card-group.css` (see [Cards & Forms](./cards.md)); TomSelect and Flatpickr have their own pages.

## form-control

Base class for text inputs and textareas (`height: 2.5rem`, transparent background, bordered). Focus draws a primary ring. `textarea.form-control` auto-grows in height and is vertically resizable (`min-height: 90px`). Readonly and disabled states are documented in their own sections below.

### Text input — default & focus

```html
<!-- Placeholder -->
<input type="text" class="form-control" placeholder="Type here…">
<!-- With value -->
<input type="text" class="form-control" value="Incident at Terminal 3">
```

### Input types — `form-control` applies to all text-family inputs

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
          <strong>3 fields</strong>&nbsp;ready to submit
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
          <strong>Draft</strong>&nbsp;autosaved a moment ago
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
          <strong>1 field</strong>&nbsp;needs review
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
          <strong>2 errors</strong>&nbsp;must be fixed
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

### Actions only — `actions-only` body (no meta)

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
