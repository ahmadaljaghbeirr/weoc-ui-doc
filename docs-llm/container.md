# Containers

[← Index](README.md)

The centered, responsive content column: `wui-container` steps through Bootstrap-compatible max-widths, and `wui-container-fluid` stays full width with the same gutters. For the 12-column row/col and CSS-grid systems see [Grid](grid.md); for flexbox utilities see [Flex](flex.md). This page documents a different component from the unrelated [Cards & Containers](containers.md) page (wui-card / wui-plane / wui-panel / wui-embed).

## wui-container

Centered, responsive content column with side gutters (`padding-inline: var(--space-4)`). `wui-container` steps through Bootstrap max-widths (540 / 720 / 960 / 1140px); `wui-container-fluid` is always full width with the same gutters. The dashed frame below marks the container edges.

### wui-container (stepped max-width)

```html
<div class="wui-container"><!-- centered content --></div>
```

### wui-container-fluid (full width)

```html
<div class="wui-container-fluid"><!-- full-width content --></div>
```
