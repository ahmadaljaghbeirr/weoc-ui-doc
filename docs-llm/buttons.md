# Buttons

[← Index](README.md)

Actions the user can trigger: `wui-btn`, the floating action button `wui-fab`, and the compact table/row action `wui-action-btn`. Every variant, size, and state is shown below with its exact markup.

## wui-btn

Base class for all buttons (`min-height: 2.375rem`). Compose with one *style* (solid is default, or `outline`/`ghost`/`neon-outline`), one *color* (`primary` … `info`), and an optional *size*. `dashed` is a modifier of `outline` and `neon-outline` only.

### Solid (default) — all colors

```html
<!-- Primary -->
<button class="wui-btn primary">Primary</button>
<!-- Secondary -->
<button class="wui-btn secondary">Secondary</button>
<!-- Success -->
<button class="wui-btn success">Success</button>
<!-- Warning -->
<button class="wui-btn warning">Warning</button>
<!-- Danger -->
<button class="wui-btn danger">Danger</button>
<!-- Info -->
<button class="wui-btn info">Info</button>
```

### Outline — all colors

```html
<!-- Primary -->
<button class="wui-btn outline primary">Primary</button>
<!-- Secondary -->
<button class="wui-btn outline secondary">Secondary</button>
<!-- Success -->
<button class="wui-btn outline success">Success</button>
<!-- Warning -->
<button class="wui-btn outline warning">Warning</button>
<!-- Danger -->
<button class="wui-btn outline danger">Danger</button>
<!-- Info -->
<button class="wui-btn outline info">Info</button>
```

### Outline — dashed

```html
<!-- Dashed (neutral) -->
<button class="wui-btn outline dashed">Dashed</button>
<!-- Dashed + color -->
<button class="wui-btn outline dashed primary">Dashed primary</button>
```

### Ghost — all colors

```html
<!-- Primary -->
<button class="wui-btn ghost primary">Primary</button>
<!-- Secondary -->
<button class="wui-btn ghost secondary">Secondary</button>
<!-- Success -->
<button class="wui-btn ghost success">Success</button>
<!-- Warning -->
<button class="wui-btn ghost warning">Warning</button>
<!-- Danger -->
<button class="wui-btn ghost danger">Danger</button>
<!-- Info -->
<button class="wui-btn ghost info">Info</button>
```

### Neon-outline — all colors

```html
<!-- Primary -->
<button class="wui-btn neon-outline primary">Primary</button>
<!-- Secondary -->
<button class="wui-btn neon-outline secondary">Secondary</button>
<!-- Success -->
<button class="wui-btn neon-outline success">Success</button>
<!-- Warning -->
<button class="wui-btn neon-outline warning">Warning</button>
<!-- Danger -->
<button class="wui-btn neon-outline danger">Danger</button>
<!-- Info -->
<button class="wui-btn neon-outline info">Info</button>
```

### Neon-outline — dashed

```html
<!-- Neon dashed + color -->
<button class="wui-btn neon-outline dashed primary">Neon dashed</button>
```

### Sizes — 2xs → 2xl (base = md)

```html
<!-- 2xs -->
<button class="wui-btn primary wui-btn-2xs">2XS</button>
<!-- xs -->
<button class="wui-btn primary wui-btn-xs">XS</button>
<!-- sm -->
<button class="wui-btn primary wui-btn-sm">SM</button>
<!-- md (base, no size class) -->
<button class="wui-btn primary">Base (md)</button>
<!-- lg -->
<button class="wui-btn primary wui-btn-lg">LG</button>
<!-- xl -->
<button class="wui-btn primary wui-btn-xl">XL</button>
<!-- 2xl -->
<button class="wui-btn primary wui-btn-2xl">2XL</button>
```

### With icons

```html
<!-- Leading icon -->
<button class="wui-btn primary"><span class="material-symbols-outlined">add</span>New report</button>
<!-- Trailing icon -->
<button class="wui-btn outline success">Approve<span class="material-symbols-outlined">check</span></button>
```

### Icon-only — all sizes

```html
<!-- 2xs -->
<button class="wui-btn primary icon-only wui-btn-2xs"><span class="material-symbols-outlined">edit</span></button>
<!-- xs -->
<button class="wui-btn primary icon-only wui-btn-xs"><span class="material-symbols-outlined">edit</span></button>
<!-- sm -->
<button class="wui-btn primary icon-only wui-btn-sm"><span class="material-symbols-outlined">edit</span></button>
<!-- md (base) -->
<button class="wui-btn primary icon-only"><span class="material-symbols-outlined">edit</span></button>
<!-- lg -->
<button class="wui-btn primary icon-only wui-btn-lg"><span class="material-symbols-outlined">edit</span></button>
<!-- xl -->
<button class="wui-btn primary icon-only wui-btn-xl"><span class="material-symbols-outlined">edit</span></button>
<!-- 2xl -->
<button class="wui-btn primary icon-only wui-btn-2xl"><span class="material-symbols-outlined">edit</span></button>
<!-- icon-only + outline dashed -->
<button class="wui-btn outline icon-only dashed"><span class="material-symbols-outlined">add</span></button>
```

### Block (full width)

```html
<!-- Full-width -->
<button class="wui-btn primary block">Full-width block button</button>
```

### Disabled

```html
<!-- Native disabled attribute -->
<button class="wui-btn primary" disabled>Disabled</button>
<!-- .disabled class -->
<button class="wui-btn outline primary disabled">Disabled (class)</button>
```

## wui-fab

Circular floating action button. Same style/color/size axes as `wui-btn`, plus `wui-fab-extended` (pill with a label) and `wui-fab-fixed-br` (pinned bottom-right).

### Solid — all colors

```html
<!-- Primary -->
<button class="wui-fab primary"><span class="material-symbols-outlined">add</span></button>
<!-- Secondary -->
<button class="wui-fab secondary"><span class="material-symbols-outlined">add</span></button>
<!-- Success -->
<button class="wui-fab success"><span class="material-symbols-outlined">add</span></button>
<!-- Warning -->
<button class="wui-fab warning"><span class="material-symbols-outlined">add</span></button>
<!-- Danger -->
<button class="wui-fab danger"><span class="material-symbols-outlined">add</span></button>
<!-- Info -->
<button class="wui-fab info"><span class="material-symbols-outlined">add</span></button>
```

### Sizes — 2xs → 2xl

```html
<!-- 2xs -->
<button class="wui-fab primary wui-fab-2xs"><span class="material-symbols-outlined">add</span></button>
<!-- xs -->
<button class="wui-fab primary wui-fab-xs"><span class="material-symbols-outlined">add</span></button>
<!-- sm -->
<button class="wui-fab primary wui-fab-sm"><span class="material-symbols-outlined">add</span></button>
<!-- md -->
<button class="wui-fab primary wui-fab-md"><span class="material-symbols-outlined">add</span></button>
<!-- lg -->
<button class="wui-fab primary wui-fab-lg"><span class="material-symbols-outlined">add</span></button>
<!-- xl -->
<button class="wui-fab primary wui-fab-xl"><span class="material-symbols-outlined">add</span></button>
<!-- 2xl -->
<button class="wui-fab primary wui-fab-2xl"><span class="material-symbols-outlined">add</span></button>
```

### Outline — all colors

```html
<!-- Primary -->
<button class="wui-fab outline primary"><span class="material-symbols-outlined">add</span></button>
<!-- Secondary -->
<button class="wui-fab outline secondary"><span class="material-symbols-outlined">add</span></button>
<!-- Success -->
<button class="wui-fab outline success"><span class="material-symbols-outlined">add</span></button>
<!-- Warning -->
<button class="wui-fab outline warning"><span class="material-symbols-outlined">add</span></button>
<!-- Danger -->
<button class="wui-fab outline danger"><span class="material-symbols-outlined">add</span></button>
<!-- Info -->
<button class="wui-fab outline info"><span class="material-symbols-outlined">add</span></button>
```

### Ghost — all colors

```html
<!-- Primary -->
<button class="wui-fab ghost primary"><span class="material-symbols-outlined">add</span></button>
<!-- Secondary -->
<button class="wui-fab ghost secondary"><span class="material-symbols-outlined">add</span></button>
<!-- Success -->
<button class="wui-fab ghost success"><span class="material-symbols-outlined">add</span></button>
<!-- Warning -->
<button class="wui-fab ghost warning"><span class="material-symbols-outlined">add</span></button>
<!-- Danger -->
<button class="wui-fab ghost danger"><span class="material-symbols-outlined">add</span></button>
<!-- Info -->
<button class="wui-fab ghost info"><span class="material-symbols-outlined">add</span></button>
```

### Neon-outline — all colors (+ dashed)

```html
<!-- Primary -->
<button class="wui-fab neon-outline primary"><span class="material-symbols-outlined">add</span></button>
<!-- Secondary -->
<button class="wui-fab neon-outline secondary"><span class="material-symbols-outlined">add</span></button>
<!-- Success -->
<button class="wui-fab neon-outline success"><span class="material-symbols-outlined">add</span></button>
<!-- Warning -->
<button class="wui-fab neon-outline warning"><span class="material-symbols-outlined">add</span></button>
<!-- Danger -->
<button class="wui-fab neon-outline danger"><span class="material-symbols-outlined">add</span></button>
<!-- Neon dashed -->
<button class="wui-fab neon-outline dashed primary"><span class="material-symbols-outlined">add</span></button>
```

### Extended (pill + label) — all colors

```html
<!-- Primary -->
<button class="wui-fab-extended primary"><span class="material-symbols-outlined">add</span>Create</button>
<!-- Secondary -->
<button class="wui-fab-extended secondary"><span class="material-symbols-outlined">add</span>Create</button>
<!-- Success -->
<button class="wui-fab-extended success"><span class="material-symbols-outlined">check</span>Approve</button>
<!-- Warning -->
<button class="wui-fab-extended warning"><span class="material-symbols-outlined">flag</span>Flag</button>
<!-- Danger -->
<button class="wui-fab-extended danger"><span class="material-symbols-outlined">delete</span>Delete</button>
<!-- Info -->
<button class="wui-fab-extended info"><span class="material-symbols-outlined">info</span>Details</button>
```

### Extended — sizes

```html
<!-- sm -->
<button class="wui-fab-extended primary wui-fab-sm"><span class="material-symbols-outlined">add</span>Small</button>
<!-- md -->
<button class="wui-fab-extended primary wui-fab-md"><span class="material-symbols-outlined">add</span>Medium</button>
<!-- lg -->
<button class="wui-fab-extended primary wui-fab-lg"><span class="material-symbols-outlined">add</span>Large</button>
<!-- xl -->
<button class="wui-fab-extended primary wui-fab-xl"><span class="material-symbols-outlined">add</span>XL</button>
<!-- 2xl -->
<button class="wui-fab-extended primary wui-fab-2xl"><span class="material-symbols-outlined">add</span>2XL</button>
```

### Disabled

```html
<!-- Circular disabled -->
<button class="wui-fab primary" disabled><span class="material-symbols-outlined">add</span></button>
<!-- Extended disabled -->
<button class="wui-fab-extended primary disabled"><span class="material-symbols-outlined">add</span>Disabled</button>
```

> **wui-fab-fixed-br:** Add `wui-fab-fixed-br` to pin a FAB to the bottom-right of its scroll container. Omitted from the live demo above so it doesn't float over the page.

## wui-action-btn

Compact, borderless icon button for table rows and card corners. Wrap a set in `wui-actions`. Color classes tint the icon on hover.

### All colors

```html
<div class="wui-actions">
  <!-- Neutral (base) -->
  <button class="wui-action-btn"><span class="material-symbols-outlined">visibility</span></button>
  <!-- Primary -->
  <button class="wui-action-btn primary"><span class="material-symbols-outlined">edit</span></button>
  <!-- Success -->
  <button class="wui-action-btn success"><span class="material-symbols-outlined">check</span></button>
  <!-- Warning -->
  <button class="wui-action-btn warning"><span class="material-symbols-outlined">flag</span></button>
  <!-- Danger -->
  <button class="wui-action-btn danger"><span class="material-symbols-outlined">delete</span></button>
  <!-- Info -->
  <button class="wui-action-btn info"><span class="material-symbols-outlined">info</span></button>
  <!-- Secondary -->
  <button class="wui-action-btn secondary"><span class="material-symbols-outlined">more_horiz</span></button>
</div>
```

## Driving a button with JavaScript

When a component needs script, the demo shows a **Markup** box and a separate **JavaScript** box, and the JS you see below is the exact JS that runs this example (`data-wui-demo-run`).

```html
<button class="wui-btn primary" id="demo-count-btn">
  <span class="material-symbols-outlined">add</span>Clicked <span id="demo-count">0</span>×
</button>
<button class="wui-btn outline secondary" id="demo-count-reset">Reset</button>
```
