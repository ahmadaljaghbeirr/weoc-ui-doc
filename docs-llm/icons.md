# Icon Bubbles

[← Index](README.md)

Semantic icon container: the `wui-icon-bubble`. Every size, shape, color, and variant is shown below with its exact markup.

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
