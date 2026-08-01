# Indicators

[← Index](README.md)

Compact visual state indicators: the `wui-status-dot`, the semantic `wui-icon-bubble`, the segmented `wui-lvl` level bar, the identity `wui-avatar`, and the `wui-elapsed` duration display. Every variant, size, and state is shown below with its exact markup.

## wui-status-dot

Tiny round status marker (base `0.5rem`). Compose the base with one *color* (`primary` … `info`) and an optional *size* (`wui-status-dot-sm`/`-lg`/`-xl`). Add `live` alongside a color for an infinite pulsing halo.

### All colors (base size)

```html
<!-- Primary -->
<span class="wui-status-dot primary"></span>
<!-- Secondary -->
<span class="wui-status-dot secondary"></span>
<!-- Success -->
<span class="wui-status-dot success"></span>
<!-- Warning -->
<span class="wui-status-dot warning"></span>
<!-- Danger -->
<span class="wui-status-dot danger"></span>
<!-- Info -->
<span class="wui-status-dot info"></span>
```

### Sizes — sm → xl (base has no size class)

```html
<!-- sm -->
<span class="wui-status-dot primary wui-status-dot-sm"></span>
<!-- base (md) -->
<span class="wui-status-dot primary"></span>
<!-- lg -->
<span class="wui-status-dot primary wui-status-dot-lg"></span>
<!-- xl -->
<span class="wui-status-dot primary wui-status-dot-xl"></span>
```

### Live (pulsing) — all colors

```html
<!-- Live primary -->
<span class="wui-status-dot live primary wui-status-dot-lg"></span>
<!-- Live secondary -->
<span class="wui-status-dot live secondary wui-status-dot-lg"></span>
<!-- Live success -->
<span class="wui-status-dot live success wui-status-dot-lg"></span>
<!-- Live warning -->
<span class="wui-status-dot live warning wui-status-dot-lg"></span>
<!-- Live danger -->
<span class="wui-status-dot live danger wui-status-dot-lg"></span>
<!-- Live info -->
<span class="wui-status-dot live info wui-status-dot-lg"></span>
```

### In context (with a label)

```html
<!-- Dot + text, operational -->
<span style="display:inline-flex;align-items:center;gap:var(--space-2)"><span class="wui-status-dot live success"></span>Operational</span>
<!-- Dot + text, incident -->
<span style="display:inline-flex;align-items:center;gap:var(--space-2)"><span class="wui-status-dot live danger"></span>Incident active</span>
```

## wui-icon-bubble

Semantic icon container, rounded-square by default (`36px`). Compose with one *size* (`sm` 28px / `md` 36px / `lg` 44px), an optional *shape* (`circle`), one *color*, and a *variant*: soft (default), `solid`, or `solid-reverse`, plus the opt-in `bordered` and `ripple` modifiers.

### Soft (default) — all colors

```html
<!-- Primary -->
<span class="wui-icon-bubble primary"><span class="material-symbols-outlined">bolt</span></span>
<!-- Info -->
<span class="wui-icon-bubble info"><span class="material-symbols-outlined">info</span></span>
<!-- Success -->
<span class="wui-icon-bubble success"><span class="material-symbols-outlined">check</span></span>
<!-- Warning -->
<span class="wui-icon-bubble warning"><span class="material-symbols-outlined">warning</span></span>
<!-- Danger -->
<span class="wui-icon-bubble danger"><span class="material-symbols-outlined">error</span></span>
<!-- Secondary -->
<span class="wui-icon-bubble secondary"><span class="material-symbols-outlined">more_horiz</span></span>
```

### Solid — all colors

```html
<!-- Primary -->
<span class="wui-icon-bubble solid primary"><span class="material-symbols-outlined">bolt</span></span>
<!-- Info -->
<span class="wui-icon-bubble solid info"><span class="material-symbols-outlined">info</span></span>
<!-- Success -->
<span class="wui-icon-bubble solid success"><span class="material-symbols-outlined">check</span></span>
<!-- Warning -->
<span class="wui-icon-bubble solid warning"><span class="material-symbols-outlined">warning</span></span>
<!-- Danger -->
<span class="wui-icon-bubble solid danger"><span class="material-symbols-outlined">error</span></span>
<!-- Secondary -->
<span class="wui-icon-bubble solid secondary"><span class="material-symbols-outlined">more_horiz</span></span>
```

### Solid-reverse (white bubble, colored icon) — all colors

```html
<!-- Primary -->
<span class="wui-icon-bubble solid-reverse primary"><span class="material-symbols-outlined">bolt</span></span>
<!-- Info -->
<span class="wui-icon-bubble solid-reverse info"><span class="material-symbols-outlined">info</span></span>
<!-- Success -->
<span class="wui-icon-bubble solid-reverse success"><span class="material-symbols-outlined">check</span></span>
<!-- Warning -->
<span class="wui-icon-bubble solid-reverse warning"><span class="material-symbols-outlined">warning</span></span>
<!-- Danger -->
<span class="wui-icon-bubble solid-reverse danger"><span class="material-symbols-outlined">error</span></span>
<!-- Secondary -->
<span class="wui-icon-bubble solid-reverse secondary"><span class="material-symbols-outlined">more_horiz</span></span>
```

> Note: this variant is demoed on a tinted surface (`background: var(--color-30)`) so the white bubble is visible.

### Sizes — sm / md / lg

```html
<!-- sm -->
<span class="wui-icon-bubble solid primary sm"><span class="material-symbols-outlined">bolt</span></span>
<!-- md (default) -->
<span class="wui-icon-bubble solid primary md"><span class="material-symbols-outlined">bolt</span></span>
<!-- lg -->
<span class="wui-icon-bubble solid primary lg"><span class="material-symbols-outlined">bolt</span></span>
```

### Circle shape — soft, solid, solid + lg

```html
<!-- Circle soft -->
<span class="wui-icon-bubble circle info"><span class="material-symbols-outlined">person</span></span>
<!-- Circle solid -->
<span class="wui-icon-bubble circle solid success"><span class="material-symbols-outlined">check</span></span>
<!-- Circle solid lg -->
<span class="wui-icon-bubble circle solid danger lg"><span class="material-symbols-outlined">priority_high</span></span>
```

### Bordered — all colors (add alongside any variant)

```html
<!-- Primary -->
<span class="wui-icon-bubble bordered primary"><span class="material-symbols-outlined">bolt</span></span>
<!-- Info -->
<span class="wui-icon-bubble bordered info"><span class="material-symbols-outlined">info</span></span>
<!-- Success -->
<span class="wui-icon-bubble bordered success"><span class="material-symbols-outlined">check</span></span>
<!-- Warning -->
<span class="wui-icon-bubble bordered warning"><span class="material-symbols-outlined">warning</span></span>
<!-- Danger -->
<span class="wui-icon-bubble bordered danger"><span class="material-symbols-outlined">error</span></span>
<!-- Secondary -->
<span class="wui-icon-bubble bordered secondary"><span class="material-symbols-outlined">more_horiz</span></span>
```

### Ripple (double-ring halo, for solid on colored surfaces)

```html
<!-- Ripple solid primary -->
<span class="wui-icon-bubble solid primary ripple"><span class="material-symbols-outlined">bolt</span></span>
<!-- Ripple solid circle success -->
<span class="wui-icon-bubble solid circle success ripple"><span class="material-symbols-outlined">check</span></span>
<!-- Ripple solid lg danger -->
<span class="wui-icon-bubble solid danger lg ripple"><span class="material-symbols-outlined">error</span></span>
```

> Note: this variant is demoed on a tinted surface (`background: var(--color-30)`) to show the ripple halo against a colored background.

## wui-lvl

Segmented level / severity bar. Root `wui-lvl` holds a `wui-lvl-bar` of `wui-lvl-seg` segments and an optional `wui-lvl-count`. Light a segment with `on`; mark the leading lit segment with `on current` for an infinite pulse. Default color is warning; add a color class on the root (`danger`, `success`, `info`, `primary`, `warning`, `secondary`) to recolor segments, glow, and count together. `wui-lvl-inner` stacks a caption over the bar.

### Structure — bar + count (default warning)

```html
<!-- 3 of 5 lit, leading one pulsing (on current) -->
<div class="wui-lvl">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
```

### Stacked inner (wui-lvl-inner)

```html
<!-- wui-lvl-inner wraps the bar in a column -->
<div class="wui-lvl danger">
  <div class="wui-lvl-inner">
    <div class="wui-lvl-bar">
      <span class="wui-lvl-seg on"></span>
      <span class="wui-lvl-seg on"></span>
      <span class="wui-lvl-seg on"></span>
      <span class="wui-lvl-seg on current"></span>
      <span class="wui-lvl-seg"></span>
    </div>
  </div>
  <span class="wui-lvl-count">4</span>
</div>
```

### Color variants (each with lit + current segment)

```html
<!-- Danger -->
<div class="wui-lvl danger">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
<!-- Warning (default) -->
<div class="wui-lvl warning">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
<!-- Success -->
<div class="wui-lvl success">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
<!-- Info -->
<div class="wui-lvl info">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
<!-- Primary -->
<div class="wui-lvl primary">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
<!-- Secondary -->
<div class="wui-lvl secondary">
  <div class="wui-lvl-bar">
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on"></span>
    <span class="wui-lvl-seg on current"></span>
    <span class="wui-lvl-seg"></span>
    <span class="wui-lvl-seg"></span>
  </div>
  <span class="wui-lvl-count">3</span>
</div>
```

## wui-avatar

Circular identity chip for initials or an icon. Compose the base with one *color* (gradient-filled) and an optional *size* (`wui-avatar-sm`/base/`-lg`/`-xl`). Use `icon` for a tinted icon avatar instead of initials.

### Initials — all colors

```html
<!-- Primary -->
<span class="wui-avatar primary">AD</span>
<!-- Info -->
<span class="wui-avatar info">JR</span>
<!-- Success -->
<span class="wui-avatar success">MK</span>
<!-- Warning -->
<span class="wui-avatar warning">SL</span>
<!-- Danger -->
<span class="wui-avatar danger">TB</span>
<!-- Secondary -->
<span class="wui-avatar secondary">EO</span>
```

### Sizes — sm → xl (base has no size class)

```html
<!-- sm -->
<span class="wui-avatar primary wui-avatar-sm">AD</span>
<!-- base (md) -->
<span class="wui-avatar primary">AD</span>
<!-- lg -->
<span class="wui-avatar primary wui-avatar-lg">AD</span>
<!-- xl -->
<span class="wui-avatar primary wui-avatar-xl">AD</span>
```

### Icon variant — all sizes

```html
<!-- sm -->
<span class="wui-avatar icon wui-avatar-sm"><span class="material-symbols-outlined">person</span></span>
<!-- base (md) -->
<span class="wui-avatar icon"><span class="material-symbols-outlined">person</span></span>
<!-- lg -->
<span class="wui-avatar icon wui-avatar-lg"><span class="material-symbols-outlined">person</span></span>
<!-- xl -->
<span class="wui-avatar icon wui-avatar-xl"><span class="material-symbols-outlined">person</span></span>
```

## wui-elapsed

Inline elapsed-time / duration display. Base color is primary; add one *color* (`success`, `warning`, `danger`, `secondary`, `info`) and an optional *size* (`sm` / default / `lg`). Lead with a material-symbols icon such as `history` or `timer`.

### All colors (default size)

```html
<!-- Default (primary) -->
<span class="wui-elapsed"><span class="material-symbols-outlined">history</span>2 hr : 14 min : 33 sec</span>
<!-- Success -->
<span class="wui-elapsed success"><span class="material-symbols-outlined">history</span>0 hr : 04 min : 12 sec</span>
<!-- Warning -->
<span class="wui-elapsed warning"><span class="material-symbols-outlined">history</span>6 hr : 41 min : 09 sec</span>
<!-- Danger -->
<span class="wui-elapsed danger"><span class="material-symbols-outlined">timer</span>18 day : 21 hr : 50 min</span>
<!-- Secondary -->
<span class="wui-elapsed secondary"><span class="material-symbols-outlined">history</span>closed after 3 day</span>
<!-- Info -->
<span class="wui-elapsed info"><span class="material-symbols-outlined">history</span>1 hr : 02 min : 55 sec</span>
```

### Sizes — sm / default / lg

```html
<!-- sm -->
<span class="wui-elapsed sm danger"><span class="material-symbols-outlined">timer</span>2 hr : 14 min : 33 sec</span>
<!-- default -->
<span class="wui-elapsed danger"><span class="material-symbols-outlined">timer</span>2 hr : 14 min : 33 sec</span>
<!-- lg -->
<span class="wui-elapsed lg danger"><span class="material-symbols-outlined">timer</span>2 hr : 14 min : 33 sec</span>
```
