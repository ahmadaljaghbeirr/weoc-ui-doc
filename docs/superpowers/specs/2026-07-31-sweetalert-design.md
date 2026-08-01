# weoc-ui: SweetAlert2 vendored + themed, wrapped as WUI.alert/WUI.confirm

**Date:** 2026-07-31
**Status:** Approved, ready for implementation
**Scope:** `weoc-ui` component library only (`JS/`, `CSS/weoc-ui/`, plus wiring the Kanban demo's reject-confirmation to use it instead of native `confirm()`).

## Background

Native browser `alert()`/`confirm()` are unstyled, block the JS thread, and can't be themed — a real UX gap for any board needing a confirm step (e.g. Kanban's `onBeforeMove` reject path currently uses a plain `confirm()` placeholder in its demo). SweetAlert2 is the standard, well-established replacement: a real, actively-maintained library, no framework dependency, CSS-class-driven so it's fully themeable via override.

## Decision

Vendor the real SweetAlert2 UMD build (JS + CSS) at the repo root under `JS/`/`CSS/`, matching this repo's existing convention for library-level third-party dependencies (uPlot, GSAP, TomSelect, Flatpickr already live as plain files directly under `JS/`, not in a `vendor/` subfolder — that subfolder pattern is specific to the separate `weoc-ui-doc` DOCS SITE's own runtime deps, not the component library itself). Wrap it behind `WUI.alert(opts)`/`WUI.confirm(opts)`, matching the `WUI.<name>(opts)` factory convention used everywhere else in this library, with the full theme override baked in as SweetAlert2 defaults so callers never see or need to know SweetAlert2-specific class names.

### Why not alternatives considered

- **Call `Swal.fire()` directly from boards/components**: rejected — every other piece of UI in this library goes through a `WUI.*` entry point; a bare third-party global would be the only exception and would leak the theming/override details to every call site instead of centralizing them once.
- **`docs/vendor/` placement**: rejected — that folder is specifically the `weoc-ui-doc` docs SITE's own vendored runtime (htmx/Alpine/Prism/MiniSearch, all things the docs site itself needs to render). SweetAlert2 is a dependency of the actual component LIBRARY that real boards load, matching uPlot/GSAP/TomSelect/Flatpickr's existing placement directly under `JS/`/`CSS/`.

## Design

### Vendoring

- `JS/sweetalert2.all.min.js` (the "all" UMD bundle, self-contained, no separate CSS-in-JS split needed) — download the real published build, verify genuine (smoke-test: load it, confirm `window.Swal` exists and `typeof Swal.fire === 'function'`), same verification discipline already used for MiniSearch/htmx/Alpine this session.
- `CSS/sweetalert2.min.css` — the library's own base stylesheet, vendored as-is (unmodified).
- `JS/wui-alert.js` — the new `WUI.alert`/`WUI.confirm` wrapper (first-party weoc-ui code, flat in `JS/` matching `wui-charts.js`/`wui-heatmap.js`/`wui-kanban.js` — there is no `JS/weoc-ui/` subfolder in this repo, only `CSS/weoc-ui/` exists as a first-party-vs-vendored split, so JS has always been flat).

All three of the above are placed directly under `CSS/`/`JS/` at repo root per explicit user instruction — nothing SweetAlert2-related is nested inside `CSS/weoc-ui/`.

### Theme override

New file `CSS/sweetalert2-weoc-theme.css` — placed flat directly under `CSS/`, alongside the vendored `sweetalert2.min.css` (explicit user placement decision: everything SweetAlert2-related — vendored CSS, vendored JS, and the override — stays flat under `CSS/`/`JS/` at repo root, not nested inside `CSS/weoc-ui/`). Targets SweetAlert2's real CSS classes (`.swal2-popup`, `.swal2-title`, `.swal2-html-container`, `.swal2-confirm`, `.swal2-cancel`, `.swal2-icon`, etc. — confirmed against the actual vendored `sweetalert2.min.css` at implementation time, not guessed), remapping every color/spacing/radius/font value to existing `weoc-ui` tokens (`--color-*`, `--space-*`, `--radius-*`, `--font-*`) so the popup looks like a native `weoc-ui` component, re-themes automatically on `wui:themechange` (SweetAlert2 popups are recreated per `.fire()` call, not persistent DOM, so this just means WUI.alert/WUI.confirm read current token values at call time — no special re-theming listener needed, simpler than the chart family's persistent-canvas case). Added to `weoc-ui-core.css`'s `@import` list via a `../sweetalert2-weoc-theme.css` relative path (deferred to controller, same convention as the other three parallel components).

### API

```js
WUI.alert({ title: 'Saved', text: 'Facility status updated.', icon: 'success' });

WUI.confirm({
  title: 'Reject this task?',
  text: 'This cannot be undone.',
  icon: 'warning',
  confirmText: 'Reject',
  cancelText: 'Cancel'
}).then(function (confirmed) {
  // confirmed: boolean -- WUI.confirm resolves true/false, not SweetAlert2's
  // own richer { isConfirmed, isDismissed, ... } result object, so callers
  // (like Kanban's onBeforeMove, which already expects a boolean/Promise<boolean>)
  // don't need to know anything about SweetAlert2's own result shape.
});
```

Internally, both call `Swal.fire({...opts, ...themeDefaults})`; `WUI.confirm` maps SweetAlert2's `result.isConfirmed` down to a plain boolean before resolving, matching the boolean contract Kanban's `onBeforeMove` (and any future caller) already expects.

### Kanban integration

Update the Kanban demo page (`docs/docs/kanban.html`, already built by the parallel Kanban task) to use `WUI.confirm(...)` in place of its native `confirm()` placeholder for the "dropping onto Rejected" demo gate — this is a small follow-up edit to an already-existing file, not a new component.

## Error handling

- SweetAlert2 fails to load (network issue, same class of failure as any other `loadScript()` dependency in this codebase): `WUI.alert`/`WUI.confirm` log a `console.warn` and fall back to native `window.alert`/`window.confirm` respectively — never a silent no-op, never a crash, matches the "graceful degradation" pattern already established for the search feature's index-fetch-failure case.

## Testing

Manual live-browser verification: call `WUI.alert()`/`WUI.confirm()` from the console on any docs page, confirm the popup renders fully themed (not default SweetAlert2 styling) in at least 2 different themes (confirm it re-themes correctly between calls after a theme switch), confirm `WUI.confirm()` resolves `true`/`false` correctly for confirm vs cancel/dismiss, confirm the Kanban demo's reject-gate now shows the themed popup instead of a native browser confirm dialog.
