# Badges & Chips

[← Index](README.md)

Compact status and metadata labels: the square status `wui-badge` and the rounded pill `wui-chip`. Every size, color, icon, and state is shown below with its exact markup.

## wui-badge

Uppercase status label. The base `wui-badge` is neutral until you add a *color* (`primary` … `info`). Add a *size* (`wui-badge-sm` … `wui-badge-xl`), `bordered` for an outline, `icon-only`, `is-interactive` for hover/press feedback, or `animate` for a pulsing status ring.

### Base (neutral, no color)

```html
<!-- Base -->
<span class="wui-badge">Badge</span>
```

### Colors — all

```html
<!-- Primary -->
<span class="wui-badge primary">Primary</span>
<!-- Secondary -->
<span class="wui-badge secondary">Secondary</span>
<!-- Success -->
<span class="wui-badge success">Success</span>
<!-- Warning -->
<span class="wui-badge warning">Warning</span>
<!-- Danger -->
<span class="wui-badge danger">Danger</span>
<!-- Info -->
<span class="wui-badge info">Info</span>
```

### Sizes — sm → xl (base has no size class)

```html
<!-- sm -->
<span class="wui-badge wui-badge-sm primary">SM</span>
<!-- base (no size class) -->
<span class="wui-badge primary">Base</span>
<!-- md -->
<span class="wui-badge wui-badge-md primary">MD</span>
<!-- lg -->
<span class="wui-badge wui-badge-lg primary">LG</span>
<!-- xl -->
<span class="wui-badge wui-badge-xl primary">XL</span>
```

### Bordered — all colors

```html
<!-- Primary -->
<span class="wui-badge bordered primary">Primary</span>
<!-- Secondary -->
<span class="wui-badge bordered secondary">Secondary</span>
<!-- Success -->
<span class="wui-badge bordered success">Success</span>
<!-- Warning -->
<span class="wui-badge bordered warning">Warning</span>
<!-- Danger -->
<span class="wui-badge bordered danger">Danger</span>
<!-- Info -->
<span class="wui-badge bordered info">Info</span>
```

### With icon

```html
<!-- Leading icon -->
<span class="wui-badge success"><span class="material-symbols-outlined">check_circle</span>Approved</span>
<!-- Trailing icon -->
<span class="wui-badge warning">Pending<span class="material-symbols-outlined">schedule</span></span>
```

### Icon scale — grows with size

```html
<!-- sm -->
<span class="wui-badge wui-badge-sm info"><span class="material-symbols-outlined">bolt</span>SM</span>
<!-- md -->
<span class="wui-badge wui-badge-md info"><span class="material-symbols-outlined">bolt</span>MD</span>
<!-- lg -->
<span class="wui-badge wui-badge-lg info"><span class="material-symbols-outlined">bolt</span>LG</span>
<!-- xl -->
<span class="wui-badge wui-badge-xl info"><span class="material-symbols-outlined">bolt</span>XL</span>
```

### Icon-only — all sizes

```html
<!-- sm -->
<span class="wui-badge wui-badge-sm icon-only primary"><span class="material-symbols-outlined">star</span></span>
<!-- base (icon-only) -->
<span class="wui-badge icon-only primary"><span class="material-symbols-outlined">star</span></span>
<!-- md -->
<span class="wui-badge wui-badge-md icon-only primary"><span class="material-symbols-outlined">star</span></span>
<!-- lg -->
<span class="wui-badge wui-badge-lg icon-only primary"><span class="material-symbols-outlined">star</span></span>
<!-- xl -->
<span class="wui-badge wui-badge-xl icon-only primary"><span class="material-symbols-outlined">star</span></span>
```

### Interactive — hover & press

```html
<!-- is-interactive -->
<span class="wui-badge primary is-interactive">Clickable</span>
<!-- is-interactive + icon -->
<span class="wui-badge danger is-interactive"><span class="material-symbols-outlined">close</span>Remove</span>
```

### Animate — pulsing status ring (per color)

```html
<!-- Primary -->
<span class="wui-badge primary animate">Primary</span>
<!-- Secondary -->
<span class="wui-badge secondary animate">Secondary</span>
<!-- Success -->
<span class="wui-badge success animate">Success</span>
<!-- Warning -->
<span class="wui-badge warning animate">Warning</span>
<!-- Danger -->
<span class="wui-badge danger animate">Danger</span>
<!-- Info -->
<span class="wui-badge info animate">Info</span>
```

## wui-chip

Rounded pill for tags, filters, and metadata. The base `wui-chip` defaults to the primary tint; override with a *color* (`primary` … `info`). Add a *size* (`wui-chip-xs` … `wui-chip-2xl`), an icon, or `icon-only`.

### Base (primary tint by default)

```html
<!-- Base -->
<span class="wui-chip">Chip</span>
```

### Colors — all

```html
<!-- Primary -->
<span class="wui-chip primary">Primary</span>
<!-- Secondary -->
<span class="wui-chip secondary">Secondary</span>
<!-- Success -->
<span class="wui-chip success">Success</span>
<!-- Warning -->
<span class="wui-chip warning">Warning</span>
<!-- Danger -->
<span class="wui-chip danger">Danger</span>
<!-- Info -->
<span class="wui-chip info">Info</span>
```

### Sizes — xs → 2xl (base = md)

```html
<!-- xs -->
<span class="wui-chip wui-chip-xs primary">XS</span>
<!-- sm -->
<span class="wui-chip wui-chip-sm primary">SM</span>
<!-- base (md) -->
<span class="wui-chip primary">Base</span>
<!-- md -->
<span class="wui-chip wui-chip-md primary">MD</span>
<!-- lg -->
<span class="wui-chip wui-chip-lg primary">LG</span>
<!-- xl -->
<span class="wui-chip wui-chip-xl primary">XL</span>
<!-- 2xl -->
<span class="wui-chip wui-chip-2xl primary">2XL</span>
```

### With icon

```html
<!-- Leading icon -->
<span class="wui-chip success"><span class="material-symbols-outlined">done</span>Verified</span>
<!-- Trailing icon (removable pattern) -->
<span class="wui-chip info">Filter<span class="material-symbols-outlined">close</span></span>
```

### Icon scale — grows with size

```html
<!-- xs -->
<span class="wui-chip wui-chip-xs info"><span class="material-symbols-outlined">tag</span>XS</span>
<!-- sm -->
<span class="wui-chip wui-chip-sm info"><span class="material-symbols-outlined">tag</span>SM</span>
<!-- md -->
<span class="wui-chip wui-chip-md info"><span class="material-symbols-outlined">tag</span>MD</span>
<!-- lg -->
<span class="wui-chip wui-chip-lg info"><span class="material-symbols-outlined">tag</span>LG</span>
<!-- xl -->
<span class="wui-chip wui-chip-xl info"><span class="material-symbols-outlined">tag</span>XL</span>
<!-- 2xl -->
<span class="wui-chip wui-chip-2xl info"><span class="material-symbols-outlined">tag</span>2XL</span>
```

### Icon-only — all sizes

```html
<!-- xs -->
<span class="wui-chip wui-chip-xs icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- sm -->
<span class="wui-chip wui-chip-sm icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- base (icon-only) -->
<span class="wui-chip icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- md -->
<span class="wui-chip wui-chip-md icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- lg -->
<span class="wui-chip wui-chip-lg icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- xl -->
<span class="wui-chip wui-chip-xl icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
<!-- 2xl -->
<span class="wui-chip wui-chip-2xl icon-only primary"><span class="material-symbols-outlined">favorite</span></span>
```
