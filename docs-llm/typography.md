# Typography

[← Index](README.md)

Text utilities: the type scale (`wui-text-2xs` … `wui-text-2xl`), font weights (`wui-extralight` … `wui-black`), semantic text colors (`wui-text-primary`, `wui-text-secondary`, `wui-text-ui`, `wui-text-danger`, `wui-text-brand`, `wui-label-text`), and single-line clamping with `wui-truncate`.

## Type scale

Font-size utilities driven by the `--text-*` tokens, each pairing a matched `line-height`. Base body text is `wui-text-base`; the scale runs from `wui-text-2xs` up to `wui-text-2xl`. Every size is marked `!important` so it wins over inherited sizing.

### 2xs → 2xl (base = wui-text-base)

```html
<!-- 2xs -->
<div class="wui-text-2xs">wui-text-2xs: The quick brown fox jumps over the lazy dog</div>
<!-- xs -->
<div class="wui-text-xs">wui-text-xs: The quick brown fox jumps over the lazy dog</div>
<!-- sm -->
<div class="wui-text-sm">wui-text-sm: The quick brown fox jumps over the lazy dog</div>
<!-- base -->
<div class="wui-text-base">wui-text-base: The quick brown fox jumps over the lazy dog</div>
<!-- md -->
<div class="wui-text-md">wui-text-md: The quick brown fox jumps over the lazy dog</div>
<!-- lg -->
<div class="wui-text-lg">wui-text-lg: The quick brown fox jumps over the lazy dog</div>
<!-- xl -->
<div class="wui-text-xl">wui-text-xl: The quick brown fox jumps over the lazy dog</div>
<!-- 2xl -->
<div class="wui-text-2xl">wui-text-2xl: The quick brown fox</div>
```

## Font weights

Weight utilities mapped to the `--font-*` tokens, from `wui-extralight` through `wui-black`. `wui-extralight`, `wui-light`, and `wui-regular` are plain declarations; `wui-medium` and heavier carry `!important`.

### extralight → black

```html
<!-- extralight -->
<div class="wui-extralight wui-text-lg">wui-extralight: Emergency Operations Center</div>
<!-- light -->
<div class="wui-light wui-text-lg">wui-light: Emergency Operations Center</div>
<!-- regular -->
<div class="wui-regular wui-text-lg">wui-regular: Emergency Operations Center</div>
<!-- medium -->
<div class="wui-medium wui-text-lg">wui-medium: Emergency Operations Center</div>
<!-- semibold -->
<div class="wui-semibold wui-text-lg">wui-semibold: Emergency Operations Center</div>
<!-- bold -->
<div class="wui-bold wui-text-lg">wui-bold: Emergency Operations Center</div>
<!-- extrabold -->
<div class="wui-extrabold wui-text-lg">wui-extrabold: Emergency Operations Center</div>
<!-- black -->
<div class="wui-black wui-text-lg">wui-black: Emergency Operations Center</div>
```

## Text colors

Semantic color utilities driven by theme tokens. `wui-text-primary`, `wui-text-secondary`, and `wui-text-ui` form the neutral text ramp; `wui-text-danger` flags errors; `wui-text-brand` applies the brand accent (`--color-10`); and `wui-label-text` is the muted color reused for form labels (same value as `wui-text-secondary`).

### All text colors

```html
<!-- primary -->
<div class="wui-text-primary wui-text-lg wui-semibold">wui-text-primary: primary body text</div>
<!-- secondary -->
<div class="wui-text-secondary wui-text-lg wui-semibold">wui-text-secondary: secondary / muted text</div>
<!-- ui -->
<div class="wui-text-ui wui-text-lg wui-semibold">wui-text-ui: subtle UI / control text</div>
<!-- danger -->
<div class="wui-text-danger wui-text-lg wui-semibold">wui-text-danger: error / destructive text</div>
<!-- brand -->
<div class="wui-text-brand wui-text-lg wui-semibold">wui-text-brand: brand accent text</div>
<!-- label-text -->
<div class="wui-label-text wui-text-lg wui-semibold">wui-label-text: form label text</div>
```

## wui-truncate

Single-line clamp with ellipsis. Width-based (`max-width: var(--wui-truncate, 20ch)`) and non-destructive: it clips visually but leaves the DOM text intact, so a child link keeps its `onclick` and it survives WebEOC `updatesection` refreshes. Override per use with `style="--wui-truncate: 30ch"` and pair with `title="full text"` for a hover tooltip.

### Clamping inside a fixed-width box

```html
<!-- Default clamp inside a 220px box -->
<div style="max-width:220px">
  <span class="wui-truncate" title="Incident 4471: structural collapse reported at Terminal 3, mutual aid requested">Incident 4471: structural collapse reported at Terminal 3, mutual aid requested</span>
</div>
```

### Custom clamp width via --wui-truncate

```html
<!-- Wider 30ch clamp via the --wui-truncate override -->
<div style="max-width:320px">
  <span class="wui-truncate" style="--wui-truncate: 30ch" title="Incident 4471: structural collapse reported at Terminal 3, mutual aid requested">Incident 4471: structural collapse reported at Terminal 3, mutual aid requested</span>
</div>
```
