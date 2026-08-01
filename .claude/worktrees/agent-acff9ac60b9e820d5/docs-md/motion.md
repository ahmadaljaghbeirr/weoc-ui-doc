# Animation

[← Index](README.md)

`weoc-anim.js` — the animation companion for weoc-ui. GSAP-powered tweens for progress rings, bars, and counters. One extra script tag; no separate GSAP CDN link needed; reduced-motion is always honored.

## Setup

Deploy `weoc-anim.js` and `gsap.min.js` together in the same server folder. The board only needs two script tags — `weoc-anim.js` self-loads GSAP from its sibling directory at runtime. If GSAP fails to load, every method silently becomes a no-op; boards never need their own guard.

```html
<!-- Deploy both to the same folder on the CDN -->
<!--   Shared/JS/gsap.min.js        (download from gsap.com) -->
<!--   Shared/JS/weoc-anim.js       (this library)           -->

<!-- Board <head> — only two script tags needed -->
<script src="Shared/JS/weoc-ui.js"></script>
<script src="Shared/JS/weoc-anim.js"></script>

<!-- WUIAnim is available synchronously (stubs) immediately.
     Real methods replace them once GSAP finishes loading.
     Safe to call before DOMContentLoaded. -->
```

> **Namespace: `window.WUIAnim`:** All methods live on `window.WUIAnim`. Stubs are installed synchronously at parse time so any board code that calls `WUIAnim.*` before GSAP loads gets a harmless no-op rather than a ReferenceError.

## WUIAnim.ring(el, toPct, opts)

Tween a `.wui-progress-ring` from its current rendered value to `toPct`. The pct text (`.wui-progress-ring-pct`) animates in sync by default.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element` | — | `.wui-progress-ring` wrapper *or* the `.wui-progress-ring-fill` circle directly. |
| `toPct` | `number` | — | Target percentage (0–100). |
| `opts.from` | `number` | DOM read | Override starting pct instead of reading from the DOM. |
| `opts.duration` | `number` | `0.85s` | Tween duration in seconds. |
| `opts.ease` | `string` | standard | GSAP ease string. Default: M3 standard curve. |
| `opts.counter` | `boolean\|Element` | `true` | Animate the pct text alongside the ring. Pass `false` to skip, or a specific element. |
| `opts.onComplete` | `function` | — | Callback fired after the tween finishes. |

### Live demo

```html
<div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap">
  <button class="wui-btn primary wui-btn-sm" id="ring-play"><span class="material-symbols-outlined">play_arrow</span> 75%</button>
  <button class="wui-btn outline secondary wui-btn-sm" id="ring-reset"><span class="material-symbols-outlined">replay</span> Reset</button>
</div>
<div style="display:flex;gap:var(--space-6);align-items:flex-start;flex-wrap:wrap">
  <div class="wui-progress-ring primary" id="demo-ring-1" data-target-pct="75">
    <svg viewBox="0 0 120 120" width="100" height="100">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
        stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">0%</div>
      <div class="wui-progress-ring-label">Ring</div>
    </div>
  </div>
</div>
```

```js
const ring = document.getElementById('my-ring');

// Tween to 75% (reads current value from DOM)
WUIAnim.ring(ring, 75);

// Tween from 0 to 50%, custom duration, skip counter
WUIAnim.ring(ring, 50, { from: 0, duration: 1.2, counter: false });

// Callback when done
WUIAnim.ring(ring, 100, { onComplete: () => console.log('done') });
```

## WUIAnim.ringEntrance(el, opts)

Animate a freshly-injected ring from 0 to its target value. Reads the target from `data-target-pct` (preferred — set by XSL) or from the rendered `stroke-dashoffset`. Use for single-ring injections; for bulk post-reload use `sectionEntrance()`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element` | — | `.wui-progress-ring` wrapper. |
| `opts.from` | `number` | `0` | Starting pct. Pass the old value after a per-row reload to animate old → new. |
| `opts.duration` | `number` | `0.85s` | Tween duration. |
| `opts.ease` | `string` | decelerate | Auto-set: M3 decelerate for entrances (from=0), standard for value changes (from>0). |
| `opts.counter` | `boolean` | `true` | Animate the pct text alongside the ring. |
| `opts.onComplete` | `function` | — | Callback fired after the tween finishes. |

### Markup + call

```html
<!-- XSL sets data-target-pct; renders fill as empty (326.73) -->
<div class="wui-progress-ring primary" data-target-pct="68">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">0%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
```

```js
// Page load: animate from 0 → data-target-pct
WUIAnim.ringEntrance(document.querySelector('.wui-progress-ring'));

// After a per-row reload: animate from old value → new value
WUIAnim.ringEntrance(ring, { from: 42 });
```

## WUIAnim.sectionEntrance(containerEl, opts)

Animate all `.wui-progress-ring` elements inside a container after a section reload or innerHTML swap. Each ring sweeps from empty to its target with a stagger — so a table of ten rings fills in left-to-right rather than all at once.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `containerEl` | `Element` | — | The reloaded container holding one or more rings. |
| `opts.stagger` | `number` | `0.06s` | Seconds between each ring start. |
| `opts.delay` | `number` | `0` | Seconds before the first ring starts. |
| `opts.duration` | `number` | `0.85s` | Each ring tween duration. |
| `opts.ease` | `string` | decelerate | GSAP ease applied to all rings. |
| `opts.onComplete` | `function` | — | Fired after the last ring finishes. |

### Live demo

```html
<div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4)">
  <button class="wui-btn primary wui-btn-sm" id="section-play"><span class="material-symbols-outlined">play_arrow</span> Play Entrance</button>
</div>
<div id="demo-section-container" style="display:flex;gap:var(--space-5);flex-wrap:wrap;align-items:flex-start">
  <div class="wui-progress-ring primary sm" data-target-pct="80">
    <svg viewBox="0 0 120 120" width="70" height="70">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
        stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">0%</div>
      <div class="wui-progress-ring-label">Power</div>
    </div>
  </div>
  <div class="wui-progress-ring success sm" data-target-pct="55">
    <svg viewBox="0 0 120 120" width="70" height="70">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
        stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">0%</div>
      <div class="wui-progress-ring-label">Water</div>
    </div>
  </div>
  <div class="wui-progress-ring warning sm" data-target-pct="30">
    <svg viewBox="0 0 120 120" width="70" height="70">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
        stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">0%</div>
      <div class="wui-progress-ring-label">Fuel</div>
    </div>
  </div>
  <div class="wui-progress-ring info sm" data-target-pct="65">
    <svg viewBox="0 0 120 120" width="70" height="70">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
        stroke-dasharray="326.73" style="stroke-dashoffset:326.73" transform="rotate(-90 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">0%</div>
      <div class="wui-progress-ring-label">Comms</div>
    </div>
  </div>
</div>
```

```js
// After reloadSection() or any innerHTML swap:
await reloadSection('items-body');
const container = document.getElementById('items-body');
WUIAnim.sectionEntrance(container);

// Custom stagger + delay
WUIAnim.sectionEntrance(container, { stagger: 0.10, delay: 0.2 });
```

## WUIAnim.completion(el, opts)

Animate a ring to 100% with a completion flourish: the arc sweeps with a spring overshoot, then the wrapper scales up and bounces back. Reserve this for moments that deserve emphasis — status transitions to "Complete", KPI modals hitting 100%. For regular value changes use `ring()`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element` | — | `.wui-progress-ring` wrapper. |
| `opts.duration` | `number` | `0.85s` | Ring sweep duration. |
| `opts.counter` | `boolean` | `true` | Animate the pct text to 100% alongside the ring. |
| `opts.onComplete` | `function` | — | Callback fired after the full flourish finishes. |

### Live demo

```html
<div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4)">
  <button class="wui-btn success wui-btn-sm" id="completion-play"><span class="material-symbols-outlined">check</span> Complete</button>
  <button class="wui-btn outline secondary wui-btn-sm" id="completion-reset"><span class="material-symbols-outlined">replay</span> Reset</button>
</div>
<div class="wui-progress-ring success" id="demo-ring-completion">
  <svg viewBox="0 0 120 120" width="100" height="100">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:163.37" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">50%</div>
    <div class="wui-progress-ring-label">Tasks</div>
  </div>
</div>
```

```js
// When an incident status changes to Complete:
const ring = document.querySelector('.wui-progress-ring');
WUIAnim.completion(ring, {
  onComplete: () => showSuccessBanner(),
});
```

## WUIAnim.counter(el, from, to, opts)

Standalone numeric ticker for any text element — independent of progress rings. Useful for KPI stat cards, elapsed time readouts, or any number that changes on reload.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element` | — | Any text element whose `textContent` will be updated. |
| `from` | `number` | — | Starting value. |
| `to` | `number` | — | Target value. |
| `opts.duration` | `number` | `0.30s` | Tick duration in seconds. |
| `opts.ease` | `string` | `power1.out` | GSAP ease. |
| `opts.suffix` | `string` | `''` | Appended after the number (e.g. `'%'`, `' units'`). |
| `opts.onComplete` | `function` | — | Callback fired when the count finishes. |

### Live demo

```html
<div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4)">
  <button class="wui-btn primary wui-btn-sm" id="counter-play"><span class="material-symbols-outlined">play_arrow</span> Count Up</button>
</div>
<div style="display:flex;gap:var(--space-6);flex-wrap:wrap">
  <div class="wui-card" style="min-width:110px">
    <div class="wui-card-body" style="align-items:center;text-align:center">
      <div class="wui-card-num" id="demo-counter-1" style="font-size:2rem;font-weight:700;color:var(--color-10)">0</div>
      <div class="wui-card-sub">Incidents</div>
    </div>
  </div>
  <div class="wui-card" style="min-width:110px">
    <div class="wui-card-body" style="align-items:center;text-align:center">
      <div class="wui-card-num" id="demo-counter-2" style="font-size:2rem;font-weight:700;color:var(--color-success)">0</div>
      <div class="wui-card-sub">Resolved</div>
    </div>
  </div>
  <div class="wui-card" style="min-width:110px">
    <div class="wui-card-body" style="align-items:center;text-align:center">
      <div class="wui-card-num" id="demo-counter-3" style="font-size:2rem;font-weight:700;color:var(--color-warning)">0%</div>
      <div class="wui-card-sub">Capacity</div>
    </div>
  </div>
</div>
```

```js
const stat = document.getElementById('incident-count');

// Basic tick from 0 to 142
WUIAnim.counter(stat, 0, 142);

// With suffix and slower duration
WUIAnim.counter(stat, 0, 78, { suffix: '%', duration: 1.0 });

// On section reload: animate from old value to new
WUIAnim.counter(stat, oldVal, newVal, { duration: 0.5 });
```

## WUIAnim.bar(el, toPct, opts)

Animate a `.wui-progress-bar-fill` width from its current value to `toPct`. Pass either the `.wui-progress-bar` wrapper or the fill element directly.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element` | — | `.wui-progress-bar` wrapper *or* `.wui-progress-bar-fill` directly. |
| `toPct` | `number` | — | Target percentage (0–100). Clamped automatically. |
| `opts.duration` | `number` | `0.85s` | Tween duration (matched to ring by default). |
| `opts.ease` | `string` | standard | GSAP ease string. |
| `opts.onComplete` | `function` | — | Callback fired when the fill reaches target. |

### Live demo

```html
<div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap">
  <button class="wui-btn primary wui-btn-sm" id="bar-play-40"><span class="material-symbols-outlined">play_arrow</span> 40%</button>
  <button class="wui-btn warning wui-btn-sm" id="bar-play-75">75%</button>
  <button class="wui-btn success wui-btn-sm" id="bar-play-100">100%</button>
  <button class="wui-btn outline secondary wui-btn-sm" id="bar-reset"><span class="material-symbols-outlined">replay</span> Reset</button>
</div>
<div class="wui-progress-bar primary" id="demo-bar" style="max-width:420px">
  <div class="wui-progress-bar-fill" style="width:0%"></div>
</div>
```

```js
const bar = document.getElementById('capacity-bar');

// Animate fill to 60%
WUIAnim.bar(bar, 60);

// Pass the fill element directly — same result
WUIAnim.bar(bar.querySelector('.wui-progress-bar-fill'), 60);

// After a data reload
WUIAnim.bar(bar, newPct, { duration: 0.6, onComplete: refreshLabel });
```

## Constants & internals

Exposed on `WUIAnim` for extension or consistency — pull these into your own board code rather than hardcoding values.

| Member | Type | Value / Description |
|---|---|---|
| `WUIAnim.RING_CIRC` | `number` | `326.73` — 2π × r(52); matches `stroke-dasharray` in `weoc-progress.css`. |
| `WUIAnim.DUR` | `object` | `{ fast: 0.18, base: 0.30, ring: 0.85, slow: 1.10 }` — aligned with CSS transition durations. |
| `WUIAnim.EASE` | `object` | `{ standard, decelerate, spring, elastic }` — Material Design 3 curves + flourish eases. |
| `WUIAnim.pctToOffset(pct)` | `function → number` | Convert 0–100 → `stroke-dashoffset`. Clamped to valid range. |
| `WUIAnim.reducedMotion()` | `function → boolean` | Live `prefers-reduced-motion` check. Checked on every method call — responds to OS changes mid-session. |

### Usage

```js
// Use duration constants for consistency
gsap.to(myEl, { opacity: 1, duration: WUIAnim.DUR.base });

// Gate any custom animation on reduced-motion
if (!WUIAnim.reducedMotion()) {
  gsap.from('.wui-card', { y: 12, opacity: 0, stagger: 0.05 });
}

// Compute dashoffset for a static inline style (XSL template)
const offset = WUIAnim.pctToOffset(68); // → 104.55
```

> **Reduced-motion is always honored — nothing to configure:** Every `WUIAnim.*` method checks `reducedMotion()` before tweening. When the OS setting is on, values are set instantly (no animation) and callbacks still fire — the interface never breaks, the motion just stops.
