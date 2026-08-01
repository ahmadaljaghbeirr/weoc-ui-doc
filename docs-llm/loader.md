# Loader

[← Index](README.md)

A reusable busy overlay for blocking a full page or a single element while work happens, plus a matching inline state for buttons: `WUI.busy(on [, targetEl])`, `WUI.buttonBusy(btn, on)`, and the declarative `data-wui-loading` attribute. Every mode is shown below, live.

> **Two files, one component:** The overlay markup, the busy/button logic, and the localizable "Please wait" label ship in the main bundle (`weoc-ui.js` / `interaction/loader.js`). The animated energy→TAQA artwork is a separate, optional companion script (`weoc-loader.js`, namespace `window.WUILoader`) that loads GSAP itself. This documentation site does not load that companion, so every demo below renders the plain CSS fallback spinner — in an app that does load it, the branded SVG swaps in automatically with no markup change.

## WUI.busy() — full-page overlay

Call `WUI.busy(true)` with no target to cover the whole viewport: a fixed, blurred backdrop plus the busy figure and "Please wait" label, and the page scroll is locked for the duration. `WUI.busy(false)` tears it down and restores scroll. Idempotent — calling it again while already open is a no-op.

### Show / hide

```html
<button class="wui-btn primary" id="loader-fullpage-btn"><span class="material-symbols-outlined">fullscreen</span>Show full-page busy (2.5s)</button>
```

## WUI.busy(el) — element-scoped overlay

Pass a target element as the second argument to scope the overlay to that element instead of the full page: it is absolutely positioned to cover the target (a positioning context is set automatically if the target is statically positioned) and does not lock page scroll. Tracked per target, so a page can have several busy regions open at once.

### Scoped over a panel

```html
<div id="loader-panel-demo" style="position:relative;width:100%;max-width:320px;min-height:120px;display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border);border-radius:var(--border-radius);font-size:var(--text-sm);color:var(--color-text-secondary)">Panel content</div>
<button class="wui-btn outline primary" id="loader-panel-btn">Busy this panel (2.5s)</button>
```

## WUI.buttonBusy(btn, on)

A lighter surface for a single action button: no overlay, just the button itself. It disables the button, adds `.is-busy` (which hides the label and renders an inline spinner via CSS), and sets `aria-busy`. Turning it off restores whatever `disabled` state the button had before — a button that was already disabled stays disabled.

### Toggle a single button

```html
<button class="wui-btn primary" id="loader-btnbusy-btn">Save</button>
```

## data-wui-loading — declarative

No JavaScript required for the common case. Add `data-wui-loading` to a `<form>` and its submit shows a busy overlay; add it to a standalone `<button>` and its click sets that button busy. Neither handler auto-hides the state — in a real form that is fine (the page navigates or reloads); a script-driven flow calls `WUI.busy(false, …)` / `WUI.buttonBusy(btn, false)` once the response comes back.

### On a form (submit)

The attribute value scopes the overlay: empty = full page, `self` = the form itself (shown here), or a CSS selector for another element on the page.

```html
<form id="loader-form-demo" data-wui-loading="self" style="position:relative;width:100%;max-width:320px">
  <div class="field-row full">
    <div class="field-item">
      <label class="field-label">Report title</label>
      <input type="text" class="form-control" placeholder="Situation update">
    </div>
  </div>
  <button type="submit" class="wui-btn primary" style="margin-top:var(--space-3)">Submit</button>
</form>
```

### On a standalone button (click)

A non-submit `button[data-wui-loading]` (or `[role="button"]`) sets itself busy on click, equivalent to calling `WUI.buttonBusy(this, true)`. Submit buttons inside a `data-wui-loading` form are already covered by the form handler above, so this path is for standalone triggers (load-more, refresh, etc).

```html
<button class="wui-btn outline primary" id="loader-declarative-btn" data-wui-loading>Load more</button>
```

## Localization

The overlay label text lives in its own `<span data-wui-i18n="LoaderPleaseWait">`, so `WUI.i18n.apply` can re-localize an already-open overlay without touching the animated trailing dots next to it. Register the `LoaderPleaseWait` key with your own EN/AR strings the same way as any other `WUI.i18n` key.

## .spin — icon utility

For a bare spinning icon with no overlay or button state, add the utility class `.spin` (from weoc-utilities.css, loaded via the core barrel) to any icon. It applies a continuous 1s linear rotation. Pair it with a Material Symbol such as `progress_activity`.

### Spinner

```html
<!-- Standalone spinning icon -->
<span class="material-symbols-outlined spin">progress_activity</span>
<!-- Inside a loading button -->
<button class="wui-btn primary" disabled><span class="material-symbols-outlined spin">progress_activity</span>Loading…</button>
```
