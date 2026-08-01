# Grid

[← Index](README.md)

The grid toolkit: a Bootstrap-compatible 12-column `wui-row`/`wui-col` system, the quick `wui-grid` CSS-grid helpers, and the `wui-bento` dashboard grid. Flexbox utilities live on the [Flex](flex.md) page; the centered content column lives on the [Containers](container.md) page. Every demo box is tinted so the layout is legible.

## wui-row / wui-col

A 12-column grid: `wui-row` is the track, `wui-col-1` … `wui-col-12` set the span. `wui-col-auto` shrinks to content, `wui-col-full` spans the whole row. Gap presets (`g-*` / `gx-*` / `gy-*`), vertical alignment (`align-*`), offsets (`wui-offset-*`), and a full set of responsive breakpoint variants (`-sm` / `-md` / `-lg` / `-xl`) are all supported.

### Even splits — 6+6, 4+4+4, 3×4

```html
<!-- 6 + 6 -->
<div class="wui-row">
  <div class="wui-col-6"><!-- col-6 --></div>
  <div class="wui-col-6"><!-- col-6 --></div>
</div>
<!-- 4 + 4 + 4 -->
<div class="wui-row">
  <div class="wui-col-4"><!-- col-4 --></div>
  <div class="wui-col-4"><!-- col-4 --></div>
  <div class="wui-col-4"><!-- col-4 --></div>
</div>
<!-- 3 + 3 + 3 + 3 -->
<div class="wui-row">
  <div class="wui-col-3"><!-- col-3 --></div>
  <div class="wui-col-3"><!-- col-3 --></div>
  <div class="wui-col-3"><!-- col-3 --></div>
  <div class="wui-col-3"><!-- col-3 --></div>
</div>
```

### Every column width — wui-col-1 … wui-col-12

```html
<!-- col-1 + col-11 -->
<div class="wui-row">
  <div class="wui-col-1"><!-- 1 --></div>
  <div class="wui-col-11"><!-- 11 --></div>
</div>
<!-- col-2 + col-10 -->
<div class="wui-row">
  <div class="wui-col-2"><!-- 2 --></div>
  <div class="wui-col-10"><!-- 10 --></div>
</div>
<!-- col-5 + col-7 -->
<div class="wui-row">
  <div class="wui-col-5"><!-- 5 --></div>
  <div class="wui-col-7"><!-- 7 --></div>
</div>
<!-- col-8 + col-4 -->
<div class="wui-row">
  <div class="wui-col-8"><!-- 8 --></div>
  <div class="wui-col-4"><!-- 4 --></div>
</div>
<!-- col-9 + col-3 -->
<div class="wui-row">
  <div class="wui-col-9"><!-- 9 --></div>
  <div class="wui-col-3"><!-- 3 --></div>
</div>
<!-- col-12 (full) -->
<div class="wui-row">
  <div class="wui-col-12"><!-- col-12 --></div>
</div>
```

### wui-col-auto & wui-col-full

```html
<!-- auto + auto (shrink to content) -->
<div class="wui-row">
  <div class="wui-col-auto"><!-- auto (content width) --></div>
  <div class="wui-col-auto"><!-- auto --></div>
</div>
<!-- full (1 / -1) -->
<div class="wui-row">
  <div class="wui-col-full"><!-- spans the whole row --></div>
</div>
```

### Offsets — wui-offset-1 … wui-offset-6

```html
<!-- offset-1 -->
<div class="wui-row">
  <div class="wui-col-4 wui-offset-1"><!-- col-4 · offset-1 --></div>
</div>
<!-- offset-2 -->
<div class="wui-row">
  <div class="wui-col-4 wui-offset-2"><!-- col-4 · offset-2 --></div>
</div>
<!-- offset-3 -->
<div class="wui-row">
  <div class="wui-col-4 wui-offset-3"><!-- col-4 · offset-3 --></div>
</div>
<!-- offset-4 -->
<div class="wui-row">
  <div class="wui-col-4 wui-offset-4"><!-- col-4 · offset-4 --></div>
</div>
<!-- offset-5 -->
<div class="wui-row">
  <div class="wui-col-3 wui-offset-5"><!-- col-3 · offset-5 --></div>
</div>
<!-- offset-6 -->
<div class="wui-row">
  <div class="wui-col-3 wui-offset-6"><!-- col-3 · offset-6 --></div>
</div>
```

### Gutter modifiers — g / gx / gy (0 … 5)

```html
<!-- g-0 (no gap) -->
<div class="wui-row g-0">
  <div class="wui-col-6"><!-- g-0 --></div>
  <div class="wui-col-6"><!-- g-0 --></div>
</div>
<!-- g-1 -->
<div class="wui-row g-1">
  <div class="wui-col-6"><!-- g-1 --></div>
  <div class="wui-col-6"><!-- g-1 --></div>
</div>
<!-- g-2 -->
<div class="wui-row g-2">
  <div class="wui-col-6"><!-- g-2 --></div>
  <div class="wui-col-6"><!-- g-2 --></div>
</div>
<!-- g-3 (default) -->
<div class="wui-row g-3">
  <div class="wui-col-6"><!-- g-3 --></div>
  <div class="wui-col-6"><!-- g-3 --></div>
</div>
<!-- g-4 -->
<div class="wui-row g-4">
  <div class="wui-col-6"><!-- g-4 --></div>
  <div class="wui-col-6"><!-- g-4 --></div>
</div>
<!-- g-5 -->
<div class="wui-row g-5">
  <div class="wui-col-6"><!-- g-5 --></div>
  <div class="wui-col-6"><!-- g-5 --></div>
</div>
<!-- gx-5 (column-gap only) -->
<div class="wui-row gx-5">
  <div class="wui-col-4"><!-- gx-5 --></div>
  <div class="wui-col-4"><!-- gx-5 --></div>
  <div class="wui-col-4"><!-- gx-5 --></div>
</div>
<!-- gy-5 (row-gap only, visible when columns wrap to a second line) -->
<div class="wui-row gy-5 gx-0">
  <div class="wui-col-12"><!-- gy-5 · row A --></div>
  <div class="wui-col-12"><!-- gy-5 · row B --></div>
</div>
```

### Vertical alignment — align-start / center / end / stretch

```html
<!-- align-start -->
<div class="wui-row align-start">
  <div class="wui-col-4"><!-- start --></div>
  <div class="wui-col-8"><!-- tall --></div>
</div>
<!-- align-center -->
<div class="wui-row align-center">
  <div class="wui-col-4"><!-- center --></div>
  <div class="wui-col-8"><!-- tall --></div>
</div>
<!-- align-end -->
<div class="wui-row align-end">
  <div class="wui-col-4"><!-- end --></div>
  <div class="wui-col-8"><!-- tall --></div>
</div>
<!-- align-stretch -->
<div class="wui-row align-stretch">
  <div class="wui-col-4"><!-- stretch --></div>
  <div class="wui-col-8"><!-- tall --></div>
</div>
```

### Responsive — wui-col-12 wui-col-md-6 wui-col-lg-4

```html
<!-- Full on mobile → halves at md → thirds at lg -->
<div class="wui-row">
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-4"><!-- 12 · md-6 · lg-4 --></div>
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-4"><!-- 12 · md-6 · lg-4 --></div>
  <div class="wui-col-12 wui-col-md-12 wui-col-lg-4"><!-- 12 · md-12 · lg-4 --></div>
</div>
```

### Responsive — the full sm / md / lg / xl scale

```html
<!-- sm set: sm-6 halves at ≥576px -->
<div class="wui-row">
  <div class="wui-col-12 wui-col-sm-6"><!-- sm-6 --></div>
  <div class="wui-col-12 wui-col-sm-6"><!-- sm-6 --></div>
</div>
<!-- md set: md-4 thirds at ≥768px -->
<div class="wui-row">
  <div class="wui-col-12 wui-col-md-4"><!-- md-4 --></div>
  <div class="wui-col-12 wui-col-md-4"><!-- md-4 --></div>
  <div class="wui-col-12 wui-col-md-4"><!-- md-4 --></div>
</div>
<!-- lg set: lg-3 quarters at ≥992px, plus lg-auto -->
<div class="wui-row">
  <div class="wui-col-6 wui-col-lg-3"><!-- lg-3 --></div>
  <div class="wui-col-6 wui-col-lg-3"><!-- lg-3 --></div>
  <div class="wui-col-12 wui-col-lg-auto"><!-- lg-auto --></div>
</div>
<!-- xl set: xl-2 sixths at ≥1200px, xl-full spanner -->
<div class="wui-row">
  <div class="wui-col-6 wui-col-xl-2"><!-- xl-2 --></div>
  <div class="wui-col-6 wui-col-xl-2"><!-- xl-2 --></div>
  <div class="wui-col-12 wui-col-xl-full"><!-- xl-full --></div>
</div>
```

## wui-grid

Quick fixed-column CSS grids without span bookkeeping. `wui-grid` + `wui-grid-1` … `wui-grid-6` for a fixed count, or `wui-grid-auto` / `wui-grid-fit` for responsive wrapping driven by `--wui-col-min`. Children span with `wui-span-2` … `wui-span-6` / `wui-span-full` and `wui-row-span-2` … `wui-row-span-4`, align with `align-*`, and pack tight with `wui-grid-dense`. Explicit placement uses `wui-col-start-*` / `wui-row-start-*`; `wui-grid-rows-*` fixes the row count; `wui-grid-fill-h` and `wui-min-h-0` handle full-height layouts.

### Fixed columns — wui-grid-1 … wui-grid-6

```html
<!-- grid-1 -->
<div class="wui-grid wui-grid-1">
  <!-- 1 cell -->
</div>
<!-- grid-2 -->
<div class="wui-grid wui-grid-2">
  <!-- 2 cells -->
</div>
<!-- grid-3 -->
<div class="wui-grid wui-grid-3">
  <!-- 3 cells -->
</div>
<!-- grid-4 -->
<div class="wui-grid wui-grid-4">
  <!-- 4 cells -->
</div>
<!-- grid-5 -->
<div class="wui-grid wui-grid-5">
  <!-- 5 cells -->
</div>
<!-- grid-6 -->
<div class="wui-grid wui-grid-6">
  <!-- 6 cells -->
</div>
```

### Responsive — wui-grid-auto (auto-fill) & wui-grid-fit (auto-fit)

```html
<!-- auto-fill: wraps when a column would be narrower than --wui-col-min (160px here) -->
<div class="wui-grid wui-grid-auto" style="--wui-col-min:160px">
  <!-- 4 auto-fill cells -->
</div>
<!-- auto-fit: same wrapping, but the last row stretches to fill the track -->
<div class="wui-grid wui-grid-fit" style="--wui-col-min:160px">
  <!-- 3 auto-fit cells -->
</div>
```

### Column spans — wui-span-2 … wui-span-6, wui-span-full

```html
<!-- 6-col grid holding a variety of spans -->
<div class="wui-grid wui-grid-6">
  <div class="wui-span-2"><!-- span-2 --></div>
  <div class="wui-span-4"><!-- span-4 --></div>
  <div class="wui-span-3"><!-- span-3 --></div>
  <div class="wui-span-3"><!-- span-3 --></div>
  <div class="wui-span-5"><!-- span-5 --></div>
  <!-- single cell fills the remaining track -->
  <div class="wui-span-6"><!-- span-6 --></div>
  <div class="wui-span-full"><!-- span-full --></div>
</div>
```

### Row spans — wui-row-span-2 … wui-row-span-4 (+ wui-grid-dense)

```html
<!-- dense packing backfills the holes left by the tall spanning items -->
<div class="wui-grid wui-grid-4 wui-grid-dense" style="grid-auto-rows:52px">
  <div class="wui-row-span-2"><!-- row-span-2 --></div>
  <!-- cell -->
  <div class="wui-row-span-3"><!-- row-span-3 --></div>
  <div class="wui-row-span-4"><!-- row-span-4 --></div>
  <!-- cell -->
  <!-- cell -->
  <!-- cell -->
  <!-- cell -->
</div>
```

### Fixed row count — wui-grid-rows-1 … wui-grid-rows-6

```html
<!-- 3 columns × explicit 2 rows; rows share the container height (minmax(0,1fr)) -->
<div class="wui-grid wui-grid-3 wui-grid-rows-2">
  <!-- 6 cells (3 cols × 2 rows) -->
</div>
```

### Grid alignment — align-start / center / end / stretch

```html
<!-- align-start -->
<div class="wui-grid wui-grid-3 align-start">
  <!-- 3 cells -->
</div>
<!-- align-center -->
<div class="wui-grid wui-grid-3 align-center">
  <!-- 3 cells -->
</div>
<!-- align-end -->
<div class="wui-grid wui-grid-3 align-end">
  <!-- 3 cells -->
</div>
<!-- align-stretch (default) -->
<div class="wui-grid wui-grid-3 align-stretch">
  <!-- 3 cells -->
</div>
```

### Explicit placement — wui-col-start-* / wui-row-start-*

```html
<!-- Place items at named tracks instead of flowing them -->
<div class="wui-grid wui-grid-4 wui-grid-rows-2">
  <div class="wui-col-start-2 wui-row-start-1"><!-- c2·r1 --></div>
  <div class="wui-col-start-4 wui-row-start-1"><!-- c4·r1 --></div>
  <div class="wui-col-start-1 wui-row-start-2"><!-- c1·r2 --></div>
  <div class="wui-col-start-3 wui-row-start-2"><!-- c3·r2 --></div>
</div>
```

### Full-height grids — wui-grid-fill-h & wui-min-h-0

```html
<!-- fill-h makes the grid take the parent's full height; min-h-0 lets a child shrink below its content instead of forcing scroll -->
<div>
  <div class="wui-grid wui-grid-2 wui-grid-fill-h">
    <div class="wui-min-h-0"><!-- shrinks, scrolls locally --></div>
    <div class="wui-min-h-0"><!-- fills the parent's height --></div>
  </div>
</div>
```

### Overflow utilities

`wui-overflow-hidden`, `wui-overflow-auto`, and `wui-overflow-y-auto` (vertical scroll only, horizontal clipped) — all `!important`, for forcing overflow behavior on a tile or panel regardless of its component defaults.

## wui-bento

A configurable dashboard grid set entirely with classes. `wui-bento` + `cols-1 … cols-8` sets the column count; tiles are placed with `wui-w-{cols}x{rows}` (from `1x1` to `12x12`). Gap reuses `wui-gap-*`. A tile can be the component itself, or a transparent `wui-bento-tile` wrapper that stretches whatever it holds. `cell-sm/md/lg` tune the flow auto-row height; `is-page` + `rows-*` switch to a fixed, non-scrolling single-screen layout where rows share the height.

### Basic bento — cols-4 with mixed tile sizes

```html
<div class="wui-bento cols-4 wui-gap-3">
  <div class="wui-bento-tile wui-w-2x2"><!-- 2x2 tile --></div>
  <div class="wui-bento-tile wui-w-2x1"><!-- 2x1 tile --></div>
  <div class="wui-bento-tile wui-w-1x1"><!-- 1x1 tile --></div>
  <div class="wui-bento-tile wui-w-1x1"><!-- 1x1 tile --></div>
  <div class="wui-bento-tile wui-span-full"><!-- full-width tile --></div>
</div>
```

### Common tile sizes — wui-w-1x1 … wui-w-12x12 (full matrix, showing 8 common combinations)

```html
<div class="wui-bento cols-4 wui-gap-2">
  <div class="wui-bento-tile wui-w-1x1"><!-- 1x1 --></div>
  <div class="wui-bento-tile wui-w-2x1"><!-- 2x1 --></div>
  <div class="wui-bento-tile wui-w-1x2"><!-- 1x2 --></div>
  <div class="wui-bento-tile wui-w-2x2"><!-- 2x2 --></div>
  <div class="wui-bento-tile wui-w-3x1"><!-- 3x1 --></div>
  <div class="wui-bento-tile wui-w-4x1"><!-- 4x1 --></div>
  <div class="wui-bento-tile wui-w-3x2"><!-- 3x2 --></div>
  <div class="wui-bento-tile wui-w-1x3"><!-- 1x3 --></div>
  <div class="wui-bento-tile wui-w-4x2"><!-- 4x2 --></div>
  <div class="wui-bento-tile wui-w-2x3"><!-- 2x3 --></div>
</div>
```

### Column counts — cols-1 / 2 / 3 / 4 / 5 / 6 / 8

```html
<!-- cols-1 -->
<div class="wui-bento cols-1 cell-sm wui-gap-2">
  <div class="wui-bento-tile"><!-- tile --></div>
</div>
<!-- cols-2 -->
<div class="wui-bento cols-2 cell-sm wui-gap-2">
  <!-- 2 tiles -->
</div>
<!-- cols-3 -->
<div class="wui-bento cols-3 cell-sm wui-gap-2">
  <!-- 3 tiles -->
</div>
<!-- cols-4 -->
<div class="wui-bento cols-4 cell-sm wui-gap-2">
  <!-- 4 tiles -->
</div>
<!-- cols-5 -->
<div class="wui-bento cols-5 cell-sm wui-gap-2">
  <!-- 5 tiles -->
</div>
<!-- cols-6 -->
<div class="wui-bento cols-6 cell-sm wui-gap-2">
  <!-- 6 tiles -->
</div>
<!-- cols-8 -->
<div class="wui-bento cols-8 cell-sm wui-gap-2">
  <!-- 8 tiles -->
</div>
```

### Flow auto-row height — cell-sm / cell-md / cell-lg

```html
<!-- cell-sm: shorter rows (minmax(90px,auto)) -->
<div class="wui-bento cols-3 cell-sm wui-gap-2">
  <!-- 3 tiles -->
</div>
<!-- cell-md: default row height (minmax(140px,auto)) -->
<div class="wui-bento cols-3 cell-md wui-gap-2">
  <!-- 3 tiles -->
</div>
<!-- cell-lg: taller rows (minmax(200px,auto)) -->
<div class="wui-bento cols-3 cell-lg wui-gap-2">
  <!-- 3 tiles -->
</div>
```

### Single-screen — is-page + rows-* (fixed, non-scrolling)

```html
<!-- is-page needs a fixed-height parent; rows-3 splits that height into 3 equal rows -->
<div>
  <div class="wui-bento cols-4 rows-3 is-page wui-gap-2">
    <div class="wui-bento-tile wui-w-2x2"><!-- 2x2 hero --></div>
    <div class="wui-bento-tile wui-w-2x1"><!-- 2x1 --></div>
    <div class="wui-bento-tile wui-w-1x1"><!-- 1x1 --></div>
    <div class="wui-bento-tile wui-w-1x1"><!-- 1x1 --></div>
    <div class="wui-bento-tile wui-span-full"><!-- full-width footer row --></div>
  </div>
</div>
```
