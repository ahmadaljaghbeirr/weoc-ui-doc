# Flex

[← Index](README.md)

Tailwind-style flexbox utilities and the matching `wui-gap-*` spacing scale. Works on any `wui-flex` container (or any `wui-grid`/`wui-row` container for the gap utilities). For the 12-column row/col and CSS-grid systems see [Grid](grid.md); for the centered content column see [Containers](container.md). Every demo box is tinted so the layout is legible.

## wui-flex

Tailwind-style flexbox utilities. Turn a container into a flex row with `wui-flex` (or inline with `wui-inline-flex`), set `wui-flex-row/col` (+ `-reverse`) and `wui-flex-wrap/nowrap`, distribute with `wui-justify-*`, cross-align with `wui-items-*`, override a single child with `wui-self-*`, and size children with `wui-flex-1/auto/none/grow/shrink-0` plus `wui-min-w-0` and the width/height shortcuts `wui-w-*` / `wui-h-*`. Display helpers `wui-d-none/block/inline/inline-block` round it out.

### Display — wui-d-none / block / inline / inline-block

```html
<!-- d-block: fills its own line -->
<div class="wui-d-block"><!-- full-line box --></div>
<!-- d-inline-block ×2 sit side by side -->
<div>
  <span class="wui-d-inline-block"><!-- inline-block --></span>
  <span class="wui-d-inline-block"><!-- inline-block --></span>
</div>
<!-- d-inline: flows within text -->
<div>text <span class="wui-d-inline"><!-- inline --></span> flows inline</div>
<!-- d-none: present in markup, not rendered -->
<div class="wui-d-none">wui-d-none (hidden)</div>
```

### Direction — row / row-reverse / col / col-reverse

```html
<!-- flex-row -->
<div class="wui-flex wui-flex-row wui-gap-2">
  <!-- 3 items -->
</div>
<!-- flex-row-reverse -->
<div class="wui-flex wui-flex-row-reverse wui-gap-2">
  <!-- 3 items -->
</div>
<!-- flex-col -->
<div class="wui-flex wui-flex-col wui-gap-2">
  <!-- 2 items -->
</div>
<!-- flex-col-reverse -->
<div class="wui-flex wui-flex-col-reverse wui-gap-2">
  <!-- 2 items -->
</div>
```

### Wrap — wui-flex-wrap / wui-flex-nowrap

```html
<!-- flex-wrap: items wrap onto a new line -->
<div class="wui-flex wui-flex-wrap wui-gap-2">
  <!-- 4 items (each flex:0 0 30%) -->
</div>
<!-- flex-nowrap: items stay on one line and shrink -->
<div class="wui-flex wui-flex-nowrap wui-gap-2">
  <!-- 4 items -->
</div>
```

### Justify — start / end / center / between / around / evenly

```html
<!-- justify-start -->
<div class="wui-flex wui-justify-start wui-gap-2">
  <!-- 2 items -->
</div>
<!-- justify-end -->
<div class="wui-flex wui-justify-end wui-gap-2">
  <!-- 2 items -->
</div>
<!-- justify-center -->
<div class="wui-flex wui-justify-center wui-gap-2">
  <!-- 2 items -->
</div>
<!-- justify-between -->
<div class="wui-flex wui-justify-between wui-gap-2">
  <!-- 2 items -->
</div>
<!-- justify-around -->
<div class="wui-flex wui-justify-around wui-gap-2">
  <!-- 2 items -->
</div>
<!-- justify-evenly -->
<div class="wui-flex wui-justify-evenly wui-gap-2">
  <!-- 2 items -->
</div>
```

### Align items — start / end / center / stretch / baseline

```html
<!-- items-start -->
<div class="wui-flex wui-items-start wui-gap-2">
  <!-- 2 items (one taller) -->
</div>
<!-- items-center -->
<div class="wui-flex wui-items-center wui-gap-2">
  <!-- 2 items (one taller) -->
</div>
<!-- items-end -->
<div class="wui-flex wui-items-end wui-gap-2">
  <!-- 2 items (one taller) -->
</div>
<!-- items-stretch -->
<div class="wui-flex wui-items-stretch wui-gap-2">
  <!-- 2 items -->
</div>
<!-- items-baseline -->
<div class="wui-flex wui-items-baseline wui-gap-2">
  <!-- 2 items (different font sizes) -->
</div>
```

### Align self — auto / start / end / center / stretch / baseline

```html
<!-- Container aligns items-center; each child overrides itself with wui-self-* -->
<div class="wui-flex wui-items-center wui-gap-2">
  <div class="wui-self-start"><!-- self-start --></div>
  <div class="wui-self-center"><!-- self-center --></div>
  <div class="wui-self-end"><!-- self-end --></div>
  <div class="wui-self-stretch"><!-- self-stretch --></div>
  <div class="wui-self-baseline"><!-- self-baseline --></div>
  <div class="wui-self-auto"><!-- self-auto --></div>
</div>
```

### Flex child sizing — flex-1 / auto / none / grow / shrink-0 / min-w-0

```html
<!-- flex-1 shares the remaining space equally -->
<div class="wui-flex wui-gap-2">
  <div class="wui-flex-1"><!-- flex-1 --></div>
  <div class="wui-flex-1"><!-- flex-1 --></div>
</div>
<!-- flex-auto (natural size) + flex-none (rigid) -->
<div class="wui-flex wui-gap-2">
  <div class="wui-flex-auto"><!-- flex-auto --></div>
  <div class="wui-flex-none"><!-- flex-none (rigid) --></div>
</div>
<!-- flex-grow only -->
<div class="wui-flex wui-gap-2">
  <div class="wui-flex-grow"><!-- flex-grow --></div>
  <!-- static -->
</div>
<!-- flex-shrink-0 (rigid label) + min-w-0 (shrinkable text) -->
<div class="wui-flex wui-gap-2" style="max-width:280px">
  <div class="wui-flex-shrink-0"><!-- shrink-0 --></div>
  <div class="wui-min-w-0"><!-- min-w-0 (text shrinks + ellipsis) --></div>
</div>
```

### Width & height shortcuts — wui-w-* / wui-h-*

```html
<!-- w-full -->
<div class="wui-w-full"><!-- 100% width --></div>
<!-- w-max -->
<div class="wui-w-max"><!-- content width --></div>
<!-- w-auto -->
<div class="wui-w-auto"><!-- auto width --></div>
<!-- h-full inside a fixed-height flex row; h-auto for contrast -->
<div class="wui-flex wui-gap-2">
  <div class="wui-h-full"><!-- h-full --></div>
  <div class="wui-h-auto wui-self-center"><!-- h-auto --></div>
</div>
```

### wui-inline-flex

```html
<span>inline:</span>
<span class="wui-inline-flex wui-items-center wui-gap-1"><!-- inline-flex chip (icon + label) --></span>
```

## wui-gap

Spacing utilities that work on any `wui-flex` or `wui-grid` container. `wui-gap-0/xs/sm/1…6/8` sets both axes; `wui-gap-x-*` sets column-gap only; `wui-gap-y-*` sets row-gap only. The scale maps to the `--space-*` tokens.

### Uniform gap — wui-gap-0 … wui-gap-8

```html
<!-- gap-0 -->
<div class="wui-flex wui-gap-0">
  <!-- 3 items -->
</div>
<!-- gap-xs -->
<div class="wui-flex wui-gap-xs">
  <!-- 3 items -->
</div>
<!-- gap-sm -->
<div class="wui-flex wui-gap-sm">
  <!-- 3 items -->
</div>
<!-- gap-1 -->
<div class="wui-flex wui-gap-1">
  <!-- 3 items -->
</div>
<!-- gap-2 -->
<div class="wui-flex wui-gap-2">
  <!-- 3 items -->
</div>
<!-- gap-3 (default) -->
<div class="wui-flex wui-gap-3">
  <!-- 3 items -->
</div>
<!-- gap-4 -->
<div class="wui-flex wui-gap-4">
  <!-- 3 items -->
</div>
<!-- gap-5 -->
<div class="wui-flex wui-gap-5">
  <!-- 3 items -->
</div>
<!-- gap-6 -->
<div class="wui-flex wui-gap-6">
  <!-- 3 items -->
</div>
<!-- gap-8 -->
<div class="wui-flex wui-gap-8">
  <!-- 3 items -->
</div>
```

### Axis gaps — wui-gap-x-* (columns) & wui-gap-y-* (rows)

```html
<!-- gap-x-5: horizontal spacing only -->
<div class="wui-grid wui-grid-3 wui-gap-x-5 wui-gap-y-0">
  <!-- 3 cells -->
</div>
<!-- gap-y-5: vertical spacing only (two rows in a 3-col grid) -->
<div class="wui-grid wui-grid-3 wui-gap-x-0 wui-gap-y-5">
  <!-- 6 cells (2 rows) -->
</div>
```
