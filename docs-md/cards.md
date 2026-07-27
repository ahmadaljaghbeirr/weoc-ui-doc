# Controls

[← Index](README.md)

Selection and value controls: the tick box `wui-checkbox`, the single-choice `wui-radio`, the tappable `wui-card-option` group, the toggle `wui-switch`, and the range `wui-slider`. Checkbox, radio, switch, and card-option are pure CSS (`:checked`); the slider fill is driven by a few lines of JS. Every variant, size, and state is shown below with its exact markup.

## wui-checkbox

A `<label class="wui-checkbox">` wrapping a real `<input type="checkbox">` (visually hidden but kept focusable), a `wui-control-box` (the drawn tick box), and a `wui-control-label`. Compose a *size* (`sm` / base / `lg`) and a *color* accent (`primary` default, or `secondary` / `info` / `success` / `warning` / `danger`). Selection is pure CSS via `:checked` — no script needed.

### Anatomy — box + label

```html
<!-- Unchecked -->
<label class="wui-checkbox">
  <input type="checkbox">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Email alerts</span>
</label>
<!-- Checked (checked attribute on the input) -->
<label class="wui-checkbox">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">SMS alerts</span>
</label>
```

### Sizes — sm / base / lg

```html
<!-- sm -->
<label class="wui-checkbox sm">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Small</span>
</label>
<!-- base (no size class) -->
<label class="wui-checkbox">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Base</span>
</label>
<!-- lg -->
<label class="wui-checkbox lg">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Large</span>
</label>
```

### Color accents — all (checked)

```html
<!-- Primary (default) -->
<label class="wui-checkbox">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Primary</span>
</label>
<!-- Secondary -->
<label class="wui-checkbox secondary">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Secondary</span>
</label>
<!-- Info -->
<label class="wui-checkbox info">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Info</span>
</label>
<!-- Success -->
<label class="wui-checkbox success">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Success</span>
</label>
<!-- Warning -->
<label class="wui-checkbox warning">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Warning</span>
</label>
<!-- Danger -->
<label class="wui-checkbox danger">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Danger</span>
</label>
```

### States — unchecked, checked, disabled

```html
<!-- Unchecked (hover the box to preview the hover ring) -->
<label class="wui-checkbox">
  <input type="checkbox">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Unchecked (hover me)</span>
</label>
<!-- Checked -->
<label class="wui-checkbox">
  <input type="checkbox" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Checked</span>
</label>
<!-- .is-disabled class on the label -->
<label class="wui-checkbox is-disabled">
  <input type="checkbox">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Disabled (class)</span>
</label>
<!-- native disabled attribute on the input -->
<label class="wui-checkbox">
  <input type="checkbox" checked disabled>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Disabled (native, checked)</span>
</label>
```

### Grouping — wui-check-group (stacked)

```html
<!-- Stacked column -->
<div class="wui-check-group">
  <label class="wui-checkbox">
    <input type="checkbox" checked>
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Notify by email</span>
  </label>
  <label class="wui-checkbox">
    <input type="checkbox">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Notify by SMS</span>
  </label>
  <label class="wui-checkbox">
    <input type="checkbox">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Notify by push</span>
  </label>
</div>
```

### Grouping — wui-check-group is-row (inline)

```html
<!-- Inline row -->
<div class="wui-check-group is-row">
  <label class="wui-checkbox">
    <input type="checkbox" checked>
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Fire</span>
  </label>
  <label class="wui-checkbox">
    <input type="checkbox">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Flood</span>
  </label>
  <label class="wui-checkbox">
    <input type="checkbox" checked>
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Storm</span>
  </label>
</div>
```

## wui-radio

Single-choice sibling of `wui-checkbox`. Same anatomy (`wui-control-box` renders a round dot instead of a tick) and the same axes: sizes `sm` / base / `lg`, the color accents, disabled states, and the `wui-check-group` wrapper. Give each `<input type="radio">` in a set the same `name` so only one can be selected. Pure CSS — no script.

### Anatomy — box + label

```html
<!-- Unselected -->
<label class="wui-radio">
  <input type="radio" name="anatomy" value="asc">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Ascending</span>
</label>
<!-- Selected (checked attribute) -->
<label class="wui-radio">
  <input type="radio" name="anatomy" value="desc" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Descending</span>
</label>
```

### Sizes — sm / base / lg

```html
<!-- sm -->
<label class="wui-radio sm">
  <input type="radio" name="rsize" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Small</span>
</label>
<!-- base -->
<label class="wui-radio">
  <input type="radio" name="rsize">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Base</span>
</label>
<!-- lg -->
<label class="wui-radio lg">
  <input type="radio" name="rsize">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Large</span>
</label>
```

### Color accents — all (selected)

```html
<!-- Primary (default) -->
<label class="wui-radio">
  <input type="radio" name="rc-primary" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Primary</span>
</label>
<!-- Secondary -->
<label class="wui-radio secondary">
  <input type="radio" name="rc-secondary" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Secondary</span>
</label>
<!-- Info -->
<label class="wui-radio info">
  <input type="radio" name="rc-info" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Info</span>
</label>
<!-- Success -->
<label class="wui-radio success">
  <input type="radio" name="rc-success" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Success</span>
</label>
<!-- Warning -->
<label class="wui-radio warning">
  <input type="radio" name="rc-warning" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Warning</span>
</label>
<!-- Danger -->
<label class="wui-radio danger">
  <input type="radio" name="rc-danger" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Danger</span>
</label>
```

### States — unselected, selected, disabled

```html
<!-- Unselected (hover to preview the hover ring) -->
<label class="wui-radio">
  <input type="radio" name="rstate" value="off">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Unselected (hover me)</span>
</label>
<!-- Selected -->
<label class="wui-radio">
  <input type="radio" name="rstate" value="on" checked>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Selected</span>
</label>
<!-- .is-disabled class on the label -->
<label class="wui-radio is-disabled">
  <input type="radio" name="rstate2">
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Disabled (class)</span>
</label>
<!-- native disabled attribute on the input -->
<label class="wui-radio">
  <input type="radio" name="rstate3" checked disabled>
  <span class="wui-control-box"></span>
  <span class="wui-control-label">Disabled (native, selected)</span>
</label>
```

### Grouping — wui-check-group (stacked)

```html
<!-- Stacked single-choice set -->
<div class="wui-check-group">
  <label class="wui-radio">
    <input type="radio" name="severity" value="low" checked>
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Low</span>
  </label>
  <label class="wui-radio">
    <input type="radio" name="severity" value="med">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Medium</span>
  </label>
  <label class="wui-radio">
    <input type="radio" name="severity" value="high">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">High</span>
  </label>
</div>
```

### Grouping — wui-check-group is-row (inline)

```html
<!-- Inline single-choice set -->
<div class="wui-check-group is-row">
  <label class="wui-radio">
    <input type="radio" name="dir" value="asc" checked>
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Ascending</span>
  </label>
  <label class="wui-radio">
    <input type="radio" name="dir" value="desc">
    <span class="wui-control-box"></span>
    <span class="wui-control-label">Descending</span>
  </label>
</div>
```

## wui-card-group / wui-card-option

A card-based option group. In the default *input mode*, each `<label class="wui-card-option">` wraps a hidden `<input type="radio">` (or `checkbox`) followed by a `wui-card-content` face holding an icon and a `wui-card-label`. Hover and `:checked` both light the card up in its accent color, so selection works with no JavaScript. Sizes on the group: `wui-card-group-sm` / base / `wui-card-group-lg` / `wui-card-group-xl`. Add `is-row` to lay each card out horizontally. In *display mode* (`is-display` on the group) there are no inputs and pointer events are suppressed; the chosen card carries `is-active`.

### Input mode — radio (single choice, base size)

```html
<div class="wui-card-group">
  <!-- Primary (pre-selected via checked) -->
  <label class="wui-card-option primary">
    <input type="radio" name="card-mode" value="map" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">map</span>
      <span class="wui-card-label">Map view</span>
    </span>
  </label>
  <!-- Primary -->
  <label class="wui-card-option primary">
    <input type="radio" name="card-mode" value="list">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">list</span>
      <span class="wui-card-label">List view</span>
    </span>
  </label>
  <!-- Primary -->
  <label class="wui-card-option primary">
    <input type="radio" name="card-mode" value="grid">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">grid_view</span>
      <span class="wui-card-label">Grid view</span>
    </span>
  </label>
</div>
```

### Input mode — checkbox (multi-select)

```html
<div class="wui-card-group">
  <!-- Success (checkbox, pre-checked) -->
  <label class="wui-card-option success">
    <input type="checkbox" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">local_fire_department</span>
      <span class="wui-card-label">Fire</span>
    </span>
  </label>
  <!-- Success (checkbox) -->
  <label class="wui-card-option success">
    <input type="checkbox">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">water_drop</span>
      <span class="wui-card-label">Flood</span>
    </span>
  </label>
  <!-- Success (checkbox, pre-checked) -->
  <label class="wui-card-option success">
    <input type="checkbox" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">cyclone</span>
      <span class="wui-card-label">Storm</span>
    </span>
  </label>
</div>
```

### Color variants — all (each shown selected via checked)

```html
<div class="wui-card-group">
  <!-- Primary -->
  <label class="wui-card-option primary">
    <input type="radio" name="cc-primary" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">star</span>
      <span class="wui-card-label">Primary</span>
    </span>
  </label>
  <!-- Secondary -->
  <label class="wui-card-option secondary">
    <input type="radio" name="cc-secondary" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bookmark</span>
      <span class="wui-card-label">Secondary</span>
    </span>
  </label>
  <!-- Info -->
  <label class="wui-card-option info">
    <input type="radio" name="cc-info" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">info</span>
      <span class="wui-card-label">Info</span>
    </span>
  </label>
  <!-- Success -->
  <label class="wui-card-option success">
    <input type="radio" name="cc-success" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">check_circle</span>
      <span class="wui-card-label">Success</span>
    </span>
  </label>
  <!-- Warning -->
  <label class="wui-card-option warning">
    <input type="radio" name="cc-warning" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">warning</span>
      <span class="wui-card-label">Warning</span>
    </span>
  </label>
  <!-- Danger -->
  <label class="wui-card-option danger">
    <input type="radio" name="cc-danger" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">dangerous</span>
      <span class="wui-card-label">Danger</span>
    </span>
  </label>
</div>
```

### Sizes — sm

```html
<!-- wui-card-group-sm -->
<div class="wui-card-group wui-card-group-sm">
  <label class="wui-card-option primary">
    <input type="radio" name="cs-sm" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Small</span>
    </span>
  </label>
  <label class="wui-card-option primary">
    <input type="radio" name="cs-sm">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Small</span>
    </span>
  </label>
</div>
```

### Sizes — base

```html
<!-- base (no size class) -->
<div class="wui-card-group">
  <label class="wui-card-option primary">
    <input type="radio" name="cs-base" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Base</span>
    </span>
  </label>
  <label class="wui-card-option primary">
    <input type="radio" name="cs-base">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Base</span>
    </span>
  </label>
</div>
```

### Sizes — lg

```html
<!-- wui-card-group-lg -->
<div class="wui-card-group wui-card-group-lg">
  <label class="wui-card-option primary">
    <input type="radio" name="cs-lg" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Large</span>
    </span>
  </label>
  <label class="wui-card-option primary">
    <input type="radio" name="cs-lg">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Large</span>
    </span>
  </label>
</div>
```

### Sizes — xl

```html
<!-- wui-card-group-xl -->
<div class="wui-card-group wui-card-group-xl">
  <label class="wui-card-option primary">
    <input type="radio" name="cs-xl" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Extra large</span>
    </span>
  </label>
  <label class="wui-card-option primary">
    <input type="radio" name="cs-xl">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">bolt</span>
      <span class="wui-card-label">Extra large</span>
    </span>
  </label>
</div>
```

### Layout — is-row (horizontal cards)

```html
<!-- is-row on the group -->
<div class="wui-card-group is-row">
  <label class="wui-card-option info">
    <input type="radio" name="crow" value="phone" checked>
    <span class="wui-card-content">
      <span class="material-symbols-outlined">call</span>
      <span class="wui-card-label">Phone</span>
    </span>
  </label>
  <label class="wui-card-option info">
    <input type="radio" name="crow" value="email">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">mail</span>
      <span class="wui-card-label">Email</span>
    </span>
  </label>
</div>
```

### Display mode — is-display + is-active (read-only, no inputs)

```html
<!-- is-display: no inputs, pointer events suppressed -->
<div class="wui-card-group is-display">
  <!-- Chosen card carries is-active -->
  <div class="wui-card-option success is-active">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">check_circle</span>
      <span class="wui-card-label">Confirmed</span>
    </span>
  </div>
  <!-- Inactive card -->
  <div class="wui-card-option success">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">schedule</span>
      <span class="wui-card-label">Pending</span>
    </span>
  </div>
  <!-- Inactive card -->
  <div class="wui-card-option success">
    <span class="wui-card-content">
      <span class="material-symbols-outlined">cancel</span>
      <span class="wui-card-label">Rejected</span>
    </span>
  </div>
</div>
```

## wui-switch

An iOS-style toggle built on a hidden checkbox. A `<label class="wui-switch">` wraps the `<input type="checkbox">`, a `wui-switch-track` (the pill) containing a `wui-switch-thumb`, and an optional `wui-switch-label`. Checking the input slides the thumb right and fills the track with the accent color. Sizes: `sm` / base / `lg`. Colors: `primary` default, or `secondary` / `info` / `success` / `warning` / `danger`. Pure CSS via `:checked` — no script.

### Anatomy — off / on

```html
<!-- Off -->
<label class="wui-switch">
  <input type="checkbox">
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Enable alerts</span>
</label>
<!-- On (checked attribute) -->
<label class="wui-switch">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Alerts on</span>
</label>
```

### Sizes — sm / base / lg

```html
<!-- sm -->
<label class="wui-switch sm">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Small</span>
</label>
<!-- base (no size class) -->
<label class="wui-switch">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Base</span>
</label>
<!-- lg -->
<label class="wui-switch lg">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Large</span>
</label>
```

### Color accents — all (on)

```html
<!-- Primary (default) -->
<label class="wui-switch">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Primary</span>
</label>
<!-- Secondary -->
<label class="wui-switch secondary">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Secondary</span>
</label>
<!-- Info -->
<label class="wui-switch info">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Info</span>
</label>
<!-- Success -->
<label class="wui-switch success">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Success</span>
</label>
<!-- Warning -->
<label class="wui-switch warning">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Warning</span>
</label>
<!-- Danger -->
<label class="wui-switch danger">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Danger</span>
</label>
```

### States — off, on, disabled

```html
<!-- Off (hover to preview) -->
<label class="wui-switch">
  <input type="checkbox">
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Off</span>
</label>
<!-- On -->
<label class="wui-switch">
  <input type="checkbox" checked>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">On</span>
</label>
<!-- .is-disabled class on the label -->
<label class="wui-switch is-disabled">
  <input type="checkbox">
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Disabled (class)</span>
</label>
<!-- native disabled attribute on the input -->
<label class="wui-switch">
  <input type="checkbox" checked disabled>
  <span class="wui-switch-track"><span class="wui-switch-thumb"></span></span>
  <span class="wui-switch-label">Disabled (native, on)</span>
</label>
```

## wui-slider

A styled `<input type="range">` inside a `wui-slider` wrapper, with an optional `wui-slider-info` row (`wui-slider-label` + `wui-slider-value`). The filled portion of the track is a gradient that reads a `--_fill` percentage custom property; JS sets it on `input` so the fill and the readout stay in sync. Firefox also fills natively via `::-moz-range-progress`. Sizes: `sm` / base / `lg`. Colors: `primary` default, or `secondary` / `info` / `success` / `warning` / `danger`. Add `stepped` plus a `wui-slider-ticks` row for discrete steps.

### Dynamic — base (live JS fill)

```html
<!-- Continuous slider; --_fill + value driven by JS -->
<div class="wui-slider primary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Priority</span>
    <span class="wui-slider-value" id="sld-basic-val">50</span>
  </div>
  <input type="range" class="wui-slider-input" id="sld-basic" min="0" max="100" value="50" style="--_fill:50%">
</div>
```

```js
var sld = document.getElementById('sld-basic');
var out = document.getElementById('sld-basic-val');
function paint() {
  var pct = (sld.value - sld.min) / (sld.max - sld.min) * 100;
  sld.style.setProperty('--_fill', pct + '%');
  out.textContent = sld.value;
}
sld.addEventListener('input', paint);
paint();
```

### Sizes — sm / base / lg (live JS fill)

```html
<!-- sm -->
<div class="wui-slider sm primary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Small</span>
    <span class="wui-slider-value" id="sld-sm-val">25</span>
  </div>
  <input type="range" class="wui-slider-input" id="sld-sm" min="0" max="100" value="25" style="--_fill:25%">
</div>
<!-- base -->
<div class="wui-slider primary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Base</span>
    <span class="wui-slider-value" id="sld-md-val">50</span>
  </div>
  <input type="range" class="wui-slider-input" id="sld-md" min="0" max="100" value="50" style="--_fill:50%">
</div>
<!-- lg -->
<div class="wui-slider lg primary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Large</span>
    <span class="wui-slider-value" id="sld-lg-val">75</span>
  </div>
  <input type="range" class="wui-slider-input" id="sld-lg" min="0" max="100" value="75" style="--_fill:75%">
</div>
```

```js
['sld-sm','sld-md','sld-lg'].forEach(function (id) {
  var sld = document.getElementById(id);
  var out = document.getElementById(id + '-val');
  function paint() {
    var pct = (sld.value - sld.min) / (sld.max - sld.min) * 100;
    sld.style.setProperty('--_fill', pct + '%');
    out.textContent = sld.value;
  }
  sld.addEventListener('input', paint);
  paint();
});
```

### Color accents — all (live JS fill)

```html
<!-- Primary (default) -->
<div class="wui-slider primary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Primary</span>
    <span class="wui-slider-value" id="sldc-primary-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-primary" min="0" max="100" value="60" style="--_fill:60%">
</div>
<!-- Secondary -->
<div class="wui-slider secondary">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Secondary</span>
    <span class="wui-slider-value" id="sldc-secondary-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-secondary" min="0" max="100" value="60" style="--_fill:60%">
</div>
<!-- Info -->
<div class="wui-slider info">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Info</span>
    <span class="wui-slider-value" id="sldc-info-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-info" min="0" max="100" value="60" style="--_fill:60%">
</div>
<!-- Success -->
<div class="wui-slider success">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Success</span>
    <span class="wui-slider-value" id="sldc-success-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-success" min="0" max="100" value="60" style="--_fill:60%">
</div>
<!-- Warning -->
<div class="wui-slider warning">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Warning</span>
    <span class="wui-slider-value" id="sldc-warning-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-warning" min="0" max="100" value="60" style="--_fill:60%">
</div>
<!-- Danger -->
<div class="wui-slider danger">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Danger</span>
    <span class="wui-slider-value" id="sldc-danger-val">60</span>
  </div>
  <input type="range" class="wui-slider-input" id="sldc-danger" min="0" max="100" value="60" style="--_fill:60%">
</div>
```

```js
['primary','secondary','info','success','warning','danger'].forEach(function (name) {
  var sld = document.getElementById('sldc-' + name);
  var out = document.getElementById('sldc-' + name + '-val');
  function paint() {
    var pct = (sld.value - sld.min) / (sld.max - sld.min) * 100;
    sld.style.setProperty('--_fill', pct + '%');
    out.textContent = sld.value;
  }
  sld.addEventListener('input', paint);
  paint();
});
```

### Stepped — .stepped + wui-slider-ticks (live JS fill)

```html
<!-- Stepped: step attribute + tick labels row -->
<div class="wui-slider stepped success">
  <div class="wui-slider-info">
    <span class="wui-slider-label">Severity</span>
    <span class="wui-slider-value" id="sld-step-val">2</span>
  </div>
  <input type="range" class="wui-slider-input" id="sld-step" min="0" max="4" step="1" value="2" style="--_fill:50%">
  <div class="wui-slider-ticks">
    <span>None</span>
    <span>Low</span>
    <span>Med</span>
    <span>High</span>
    <span>Critical</span>
  </div>
</div>
```

```js
var sld = document.getElementById('sld-step');
var out = document.getElementById('sld-step-val');
function paint() {
  var pct = (sld.value - sld.min) / (sld.max - sld.min) * 100;
  sld.style.setProperty('--_fill', pct + '%');
  out.textContent = sld.value;
}
sld.addEventListener('input', paint);
paint();
```
