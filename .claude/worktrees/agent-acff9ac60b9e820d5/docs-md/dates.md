# Date & Time

[← Index](README.md)

Date, time, datetime, and range pickers powered by `flatpickr-factory.js`. Add `data-fp-preset` to any `<input>` and the factory auto-inits it, styling it with `flatpickr-input` and the `flat-date` / `flat-time` / `flat-range-*` skins. Vendor CSS/JS are loaded globally by the docs shell.

## How the factory binds

The factory exposes the global `window.FlatpickrFactory` with `init(scope)`, `PRESETS`, and `FMT`. On load it calls `FlatpickrFactory.init()`, which runs `querySelectorAll('[data-fp-preset]')` over the scope and initializes every matching input (already-initialized inputs carry `_flatpickr` and are skipped). Every input dispatches a bubbling `fp:change` CustomEvent (`e.detail.dateStr`) on selection.

> **Re-init after SPA navigation:** These demos are initialized by `PAGE_INIT.dates` in `docs-shell.js` (which calls `FlatpickrFactory.init()`), so they re-bind after every Barba/SPA swap. The classes `flat-date` / `flat-time` / `flat-range-start` / `flat-range-end` are cosmetic only; binding is driven entirely by `data-fp-preset`.

## Date only

Calendar picker, no time. `date` renders ISO `Y-m-d`; `date-dmy` renders `d/m/Y`.

### date / date-dmy

```html
<!-- ISO date (Y-m-d) -->
<input id="fp-date" class="flatpickr-input flat-date" data-fp-preset="date" placeholder="YYYY-MM-DD">
<!-- DMY date (d/m/Y) -->
<input id="fp-date-dmy" class="flatpickr-input flat-date" data-fp-preset="date-dmy" placeholder="DD/MM/YYYY">
```

```js
// Auto-bound by FlatpickrFactory.init() over [data-fp-preset]:
//   <input class="flatpickr-input flat-date" data-fp-preset="date">      // YYYY-MM-DD
//   <input class="flatpickr-input flat-date" data-fp-preset="date-dmy">  // DD/MM/YYYY
FlatpickrFactory.init();
```

## Time only

`noCalendar` presets — the time spinner with no date. `time` is 24hr (`H:i`); `time-12` is 12hr with AM/PM (`h:i K`).

### time / time-12

```html
<!-- 24hr time -->
<input id="fp-time" class="flatpickr-input flat-time" data-fp-preset="time" placeholder="HH:MM">
<!-- 12hr time (AM/PM) -->
<input id="fp-time-12" class="flatpickr-input flat-time" data-fp-preset="time-12" placeholder="HH:MM AM/PM">
```

```js
// noCalendar presets — time spinner only:
//   <input class="flatpickr-input flat-time" data-fp-preset="time">     // 24hr H:i
//   <input class="flatpickr-input flat-time" data-fp-preset="time-12">  // 12hr h:i K
FlatpickrFactory.init();
```

## Date + time

`enableTime` presets combining calendar and clock. Format and 12/24hr vary per preset; `datetime-seconds` adds a seconds spinner.

### datetime / datetime-dmy / datetime-12 / datetime-seconds

```html
<!-- Datetime 24hr (Y-m-d H:i) -->
<input id="fp-datetime" class="flatpickr-input flat-date" data-fp-preset="datetime" placeholder="YYYY-MM-DD HH:MM">
<!-- Datetime DMY 24hr (d/m/Y H:i) -->
<input id="fp-datetime-dmy" class="flatpickr-input flat-date" data-fp-preset="datetime-dmy" placeholder="DD/MM/YYYY HH:MM">
<!-- Datetime DMY 12hr (d/m/Y h:i K) -->
<input id="fp-datetime-12" class="flatpickr-input flat-date" data-fp-preset="datetime-12" placeholder="DD/MM/YYYY h:MM AM/PM">
<!-- Datetime + seconds (Y-m-d H:i:S) -->
<input id="fp-datetime-seconds" class="flatpickr-input flat-date" data-fp-preset="datetime-seconds" placeholder="YYYY-MM-DD HH:MM:SS">
```

```js
//   <input data-fp-preset="datetime">          // YYYY-MM-DD HH:MM, 24hr
//   <input data-fp-preset="datetime-dmy">      // DD/MM/YYYY HH:MM, 24hr
//   <input data-fp-preset="datetime-12">       // DD/MM/YYYY h:MM AM/PM
//   <input data-fp-preset="datetime-seconds">  // YYYY-MM-DD HH:MM:SS
FlatpickrFactory.init();
```

## Future-only & past-only

Bounded presets that clamp the selectable range against *now*. The min/max is refreshed in an `onOpen` hook so the boundary stays accurate across a long-lived page. `past-datetime` also adds 12hr time + seconds.

### future-date / past-date

```html
<!-- Future date only (no past dates) -->
<input id="fp-future-date" class="flatpickr-input flat-date" data-fp-preset="future-date" placeholder="From today onward">
<!-- Past date only (no future dates) -->
<input id="fp-past-date" class="flatpickr-input flat-date" data-fp-preset="past-date" placeholder="Up to today">
```

```js
//   <input data-fp-preset="future-date">  // no past dates; min refreshed on open
//   <input data-fp-preset="past-date">    // no future dates
FlatpickrFactory.init();
```

### future-datetime / past-datetime

```html
<!-- Future date + 24hr time -->
<input id="fp-future-datetime" class="flatpickr-input flat-date" data-fp-preset="future-datetime" placeholder="From now onward">
<!-- Past date + 12hr time + seconds -->
<input id="fp-past-datetime" class="flatpickr-input flat-date" data-fp-preset="past-datetime" placeholder="Up to now">
```

```js
//   <input data-fp-preset="future-datetime">  // date + 24hr time, future only
//   <input data-fp-preset="past-datetime">    // date + 12hr time + seconds, past only
FlatpickrFactory.init();
```

## Date range (paired)

Two inputs that constrain each other: both share a `data-fp-range-group`, with `data-fp-range-role="start"` on one and `"end"` on the other. The start's selection becomes the end's minimum and vice-versa. Wrap the pair in `wui-date-range-wrap` for the tight flex row.

### range-start + range-end

```html
<div class="wui-date-range-wrap">
  <!-- Range start (Y-m-d H:i:S, 24hr) -->
  <input id="fp-range-start" class="flatpickr-input flat-range-start" data-fp-preset="range-start" data-fp-range-group="docs-window" data-fp-range-role="start" placeholder="Start">
  <span class="material-symbols-outlined">arrow_forward</span>
  <!-- Range end (Y-m-d H:i:S, 24hr) -->
  <input id="fp-range-end" class="flatpickr-input flat-range-end" data-fp-preset="range-end" data-fp-range-group="docs-window" data-fp-range-role="end" placeholder="End">
</div>
```

```js
//   <input data-fp-preset="range-start"
//          data-fp-range-group="incident-window"
//          data-fp-range-role="start">
//   <input data-fp-preset="range-end"
//          data-fp-range-group="incident-window"
//          data-fp-range-role="end">
FlatpickrFactory.init();  // pairs resolve by shared range-group
```

## Inline calendar

`data-fp-inline="true"` embeds the calendar permanently in place instead of opening a popup. Works with any preset; useful for date panels and dashboard filter widgets.

### date · inline

```html
<!-- Inline date calendar -->
<input id="fp-inline" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-inline="true">
```

```js
//   <input data-fp-preset="date" data-fp-inline="true">
//   <input data-fp-preset="datetime" data-fp-inline="true">
FlatpickrFactory.init();
```

## Per-input overrides

Any preset can be tuned inline with `data-fp-*` overrides: `data-fp-format` (a `Y-m-d` string or an alias like `dmy-hi`), `data-fp-min-date` / `data-fp-max-date`, `data-fp-enable-time`, `data-fp-24hr`, `data-fp-seconds`, `data-fp-allow-input`, `data-fp-week-numbers`, `data-fp-mode` (`single`/`multiple`/`range`), `data-fp-position`, `data-fp-default-date`, and `data-fp-on-change` (name of a global handler).

### Override examples

```html
<!-- Manual text entry + week numbers -->
<input id="fp-ov-input" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-allow-input="true" data-fp-week-numbers="true" placeholder="Type or pick">
<!-- Bounded window via min/max -->
<input id="fp-ov-bounds" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-min-date="2026-01-01" data-fp-max-date="2026-12-31" placeholder="2026 only">
<!-- Native multi-select mode -->
<input id="fp-ov-multiple" class="flatpickr-input flat-date" data-fp-preset="date" data-fp-mode="multiple" placeholder="Pick several dates">
<!-- Format alias override (dmy-hi = d/m/Y H:i) -->
<input id="fp-ov-format" class="flatpickr-input flat-date" data-fp-preset="datetime" data-fp-format="dmy-hi" placeholder="DD/MM/YYYY HH:MM">
```

```js
//   data-fp-allow-input="true" data-fp-week-numbers="true"  // type-in + ISO week col
//   data-fp-min-date="2026-01-01" data-fp-max-date="2026-12-31"
//   data-fp-mode="multiple"                                 // native multi-select
//   data-fp-format="dmy-hi"                                 // alias -> d/m/Y H:i
FlatpickrFactory.init();
```

## Readonly display

Flatpickr always sets `[readonly]` internally. For a true display-only field, add `.is-readonly` to the input and disable opening with `fp.set('clickOpens', false)`. The dashed border and muted surface match the form-control readonly language.

### Editable vs readonly

```html
<!-- Editable date -->
<input id="fp-editable" class="flatpickr-input flat-date" data-fp-preset="date" placeholder="YYYY-MM-DD">
<!-- Readonly display date -->
<input id="fp-readonly" class="flatpickr-input flat-date is-readonly" data-fp-preset="date" data-fp-default-date="2026-06-24">
```

```js
// Bind both, then lock the readonly one open-less:
FlatpickrFactory.init();
var ro = document.getElementById('fp-readonly');
if (ro && ro._flatpickr) {
  ro.classList.add('is-readonly');
  ro._flatpickr.set('clickOpens', false);
}
```
