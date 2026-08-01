# Avatars

[← Index](README.md)

Circular identity chip: the `wui-avatar`. Every color, size, and variant is shown below with its exact markup.

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
