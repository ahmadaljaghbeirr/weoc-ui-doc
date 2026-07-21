# PrimeNG Select + DatePicker Bridge

> Placeholder. Real bridge stylesheet already exists at
> `angular/projects/demo/src/styles/primeng-weoc-ui-bridge.css` (Wave 1 Task 8) — this page needs to
> be written up from it, not re-derived.

## To document

- [ ] Which PrimeNG Aura theme tokens this overrides (`--p-primary-color`, `--p-primary-contrast-color`,
      `--p-content-border-radius`, `--p-form-field-border-radius`, `--p-focus-ring-color`)
- [ ] Which `weoc-ui-css` tokens they map to (`--color-10`, `--color-on-accent`, `--radius-md`)
- [ ] Why `!important` is required (PrimeNG injects its theme via a runtime `<style>` tag after the
      page's own stylesheets — plain source-order overrides lose the cascade)
- [ ] Live before/after screenshots or embedded demo
- [ ] Known limitation: OS-level dark mode auto-switches PrimeNG's theme independently of
      `weoc-ui-css`'s manual `data-theme` attribute — call this out so consumers aren't surprised
