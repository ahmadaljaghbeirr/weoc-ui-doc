# PrimeNG restyle bridge — full guide

Ground truth for this guide is the real, working bridge stylesheet:
`angular/projects/demo/src/styles/primeng-weoc-ui-bridge.css` (1041 lines, read in full).
Every token name/value below is copied from that file, not from general PrimeNG knowledge.
Wiring is in `angular/projects/demo/src/app/app.ts` and `angular/projects/demo/src/app/app.config.ts`.
Per-component narrative detail comes from `.superpowers/sdd/*-bridge-report.md` at the worktree root.

This guide covers the 8 PrimeNG components bridged so far: **Popover, Dialog, Drawer, Button,
ConfirmDialog, Toast, Tabs, Menu**. Select and DatePicker are covered by the separate
`select-datepicker.md` stub in this same folder — not duplicated here.

---

## 1. What this is and why

**Core insight:** PrimeNG's Aura theme (v18+, via `@primeuix/themes`) exposes every visual
property of every component as an overridable CSS custom property, `--p-<component>-<path>`
(e.g. `--p-button-primary-background`, `--p-dialog-border-radius`). PrimeNG's `ThemeService`
generates a `:root { --p-*: ... }` rule from the active preset (Aura) and injects it via a
`<style>` tag at runtime. A stylesheet that overrides the same custom properties with
`weoc-ui-css` tokens (`var(--color-10)`, `var(--space-3)`, etc.) makes PrimeNG's real,
unmodified components render with weoc-ui's visual language, with zero changes to PrimeNG's
own source.

**Explicit non-goal:** this is **not** a migration to custom Angular components, and not a
weoc-ui component library reimplementing PrimeNG's behavior. The real-world use case is
restyling apps that **already use PrimeNG** — its components, its behavior, its accessibility —
where the ask is "make it look like weoc-ui" without a behavioral rewrite. weoc-ui-css supplies
the skin only.

**What is genuinely untouched:** PrimeNG's component logic, DOM structure, class names,
accessibility (ARIA, focus trap, keyboard nav), animations, and JS behavior (toggle, dismiss,
positioning, stacking) all ship exactly as PrimeNG wrote them. Every bridge report in this series
independently confirmed this by driving the real component in a browser and observing that
open/close/dismiss/hover/keyboard interactions worked with zero custom JS added — the demo app
never wires its own toggle, backdrop, or animation logic; it only calls PrimeNG's own APIs
(`pop.toggle($event)`, `[(visible)]`, `ConfirmationService.confirm()`, `MessageService.add()`,
`menu.toggle($event)`).

---

## 2. Getting `weoc-ui-css` into any Angular project

`weoc-ui-css` (`angular/packages/weoc-ui-css/`) has no build step. Its `package.json`:

```json
{
  "name": "weoc-ui-css",
  "main": "index.css",
  "style": "index.css",
  "files": ["index.css", "tokens/", "components/"]
}
```

`index.css` is plain `@import`s, nothing generated:

```css
@import "./tokens/agency-theme.css";
@import "./tokens/weoc-reset.css";
@import "./tokens/weoc-typography.css";
@import "./tokens/weoc-fonts.css";
@import "./tokens/weoc-grid.css";
@import "./tokens/weoc-utilities.css";
@import "./components/buttons.css";
```

Any environment that can serve/bundle plain CSS `@import`s can consume it directly — no Sass,
no PostCSS, no build tool required.

**Not published to any registry yet.** Three real distribution options exist; picking one is a
per-project decision, not prescribed here:

1. **Copy the folder in.** Simplest, zero tooling. Drawback: no automatic upstream updates,
   drift risk if `weoc-ui-css` changes.
2. **Git submodule / subtree.** Keeps a live link to the source repo, `git subtree pull` (or
   submodule update) brings in changes deliberately. Drawback: submodules are notoriously easy
   to mishandle (detached HEAD, forgotten `--init`); subtree avoids that but rewrites history on
   pull.
3. **Publish to a private registry** (npm private registry, GitHub Packages, Verdaccio, etc.).
   Cleanest long-term (`npm install weoc-ui-css`, semver, standard tooling). Drawback: requires
   registry infrastructure and a release process that doesn't exist yet for this package.

**The 2-line wiring pattern** every consuming app needs, in its global styles file, in this
order:

```css
@import "weoc-ui-css/index.css";        /* 1. weoc-ui-css tokens + base CSS first */
@import "./primeng-weoc-ui-bridge.css"; /* 2. the bridge, which references those tokens */
```

Order matters: the bridge stylesheet's `var(--color-10)` etc. calls must resolve against
tokens that are already defined. `angular/projects/demo/src/styles.css` is the reference
example of this wiring (plus `primeicons/primeicons.css`, needed only because the demo uses
`pi pi-*` icon classes in its ConfirmDialog example).

---

## 3. The bridge methodology (repeatable process for every component)

This is the process actually followed for all 8 components in this series, in order. Follow it
exactly to add a 9th.

1. **Find the real PrimeNG `--p-*` token names.** Read
   `node_modules/@primeuix/styles/dist/<component>/index.mjs` and grep every `dt('<component>.*')`
   call. Never guess a token name — PrimeNG's exact token surface varies by version and isn't
   fully documented. Cross-check the generated CSS-variable name against
   `node_modules/@primeuix/styled/dist/index.mjs`'s own `dt()`/`getVariableName` logic if a path
   looks unusual (it generically lowercases and dash-joins any dotted path and prefixes `--p-`,
   so `menu.item.icon.size` → `--p-menu-item-icon-size` even for paths not listed in
   `@primeuix/themes/tokens/index.mjs`'s partial catalog — confirmed during the Menu bridge).
   Also read the matching `node_modules/@primeuix/themes/dist/aura/<component>/index.mjs` to see
   Aura's own defaults, useful for confirming which per-variant/per-severity tokens Aura itself
   ships.

2. **Find the real weoc-ui-css target values.** Read the actual WebEOC-era CSS source for the
   equivalent component, in `CSS/weoc-ui/*.css` **at the repo root** — not
   `angular/packages/weoc-ui-css/`, which currently only has foundation tokens + buttons ported
   (see §5). The rest of weoc-ui's real CSS (overlays, feedback, navigation, layout) lives only
   at the repo root; bridge work reads it as reference material and does not need to port the
   file itself to use it as a source.

3. **Map vocabularies.** PrimeNG's severity/style naming doesn't always match weoc-ui's. Flag
   mismatches explicitly rather than silently guessing or dropping a value — e.g. PrimeNG's
   button severity `warn` maps to weoc-ui's `warning` color (`--color-warning*`); PrimeNG's Text
   button style maps to weoc-ui's `ghost` modifier (conceptually closest, not a literal name
   match).

4. **Leave true gaps unset.** When PrimeNG has a severity/variant/state weoc-ui has no
   equivalent for, do not invent a plausible value — leave the token unset and say why in a
   comment. Real examples from this series: Button's `help`/`contrast` severities and `link`
   style (Aura-only, no weoc-ui color); Menu's whole `submenu.*` group (weoc-ui's dropdown has no
   nested-menu concept); Tabs' `nav.button.*` scroll arrows (weoc-ui's tablist is plain
   `overflow-x: auto`, no scroll-arrow control).

5. **Label sourcing honestly: hard-sourced vs. soft-defaulted.** When a value has no exact
   source but a reasonable default exists, use the closest sensible token and mark it a soft
   default in the comment — never claim it as hard-sourced. Example: `--p-dialog-border-color`
   has no 1:1 source (`.wui-modal-dialog` has no visible outer border), so it reuses
   `--color-border`, the same neutral token nearby header/footer dividers already use, labeled
   explicitly as a soft default.
   **A real lesson from this series:** during the ConfirmDialog bridge, the initially suggested
   value for `--p-confirmdialog-message-font-size` was `--text-sm`. Actually tracing the full
   cascade (the message `<p>`, `.wui-modal-body`, and `weoc-reset.css`'s `body` rule) showed no
   font-size rule anywhere except `body { font-size: var(--text-base) }`, which the message
   inherits — `--text-sm` had no basis in the real cascade and was silently wrong. It was
   corrected to `--text-base` only after reading the cascade in full, not assumed. Treat this as
   the standing reminder: verify every soft/inferred default by tracing the actual rendering
   chain, don't let a plausible-sounding guess stand in for it.

6. **Add `!important`, and only for this reason.** PrimeNG's `ThemeService` injects its own
   generated `:root { --p-*: ... }` rule via a `<style>` tag at runtime, **after** the app's own
   stylesheet `<link>` in `<head>`. At equal specificity, later-in-source wins, so a plain
   override is silently beaten by PrimeNG's own injected values — confirmed empirically in this
   series: without `!important`, `--p-primary-color` stayed at Aura's default emerald `#34d399`
   despite the override being present in source. `!important` is the correct, narrow fix for
   this one specific problem. It is used for nothing else in the bridge file — every declaration
   inside a `:root { ... }` block gets it, purely to win this one cascade fight.

7. **Use the "beyond tokens" escape hatch sparingly.** Used exactly once so far, for Toast. When
   PrimeNG's token model has no slot for a real visual difference weoc-ui's design needs, pure
   token overrides can't express it. Toast's case: weoc-ui's toast uses ONE neutral card color
   for every severity, differentiated only by a colored left accent bar
   (`border-inline-start`); PrimeNG's tokens assume a fully severity-tinted card and have no
   token for "a rail on an otherwise neutral card." Fix: add a small supplemental CSS rule
   targeting PrimeNG's own real, verified class names directly, e.g.
   `.p-toast-message-success .p-toast-message-content { border-inline-start: var(--border-sm)
   solid var(--color-success-text); }`. This still doesn't touch PrimeNG's source — it's a normal
   CSS rule added alongside the token overrides, no `!important` needed (it's a brand-new
   selector, not fighting the injected `:root` rule). Reach for this only when tokens genuinely
   cannot express the needed difference; every other component in this series fit PrimeNG's
   token surface 1:1 and needed no such rule.

8. **Verify before calling it done.** Every component in this series was: (a) visually confirmed
   in a real browser via `mcp__claude-in-chrome__*` tooling (screenshots, computed styles), not
   assumed to work from source alone; (b) interaction-checked (toggle/dismiss/hover/keyboard,
   full open-close-reopen cycles) to confirm PrimeNG's own untouched logic still functions; (c)
   run through both Angular test suites (`npx ng test weoc-ui-ng --watch=false` and
   `npx ng test demo --watch=false`) to confirm no regression. Console output was also checked
   for app-related errors (ignoring generic Chrome-extension messaging noise).

---

## 4. Per-component reference

Marker legend used throughout: **H** = hard-sourced (copied from a real weoc-ui CSS rule) ·
**S** = soft/inferred default (reasonable value, no 1:1 source, labeled honestly) · **U** = no
weoc-ui equivalent, intentionally left unset (listed for completeness, not a token to add).

### 4.1 Popover

- Import/selector: `import { Popover } from 'primeng/popover';` → `<p-popover #pop>` /
  `pop.toggle($event)`.
- Real tokens confirmed via `node_modules/@primeuix/styles/dist/popover/index.mjs`.
  `--p-popover-gutter` (arrow size/spacing) is left at its Aura default — not overridden.

| Token | Value | Src |
|---|---|---|
| `--p-popover-background` | `var(--color-30)` | H |
| `--p-popover-color` | `var(--color-text-primary)` | H |
| `--p-popover-border-color` | `var(--color-border)` | H |
| `--p-popover-border-radius` | `var(--border-radius)` | H |
| `--p-popover-shadow` | `var(--shadow-md)` | H (elevation tier shared with Menu) |
| `--p-popover-content-padding` | `var(--space-3) var(--space-4)` | H |

Note: `--color-text-primary` was used in place of a suggested-but-nonexistent `--color-text`
token — confirmed absent from `agency-theme.css` before substituting the real token.

### 4.2 Dialog

- Import/selector: `import { Dialog } from 'primeng/dialog';` → `<p-dialog header="..."
  [modal]="true" [(visible)]="dialogVisible">`.
- Mapped against `CSS/weoc-ui/weoc-overlays.css`'s `.wui-modal-dialog/-header/-title/-body/-footer`.

| Token | Value | Src |
|---|---|---|
| `--p-dialog-border-radius` | `var(--border-radius)` | H |
| `--p-dialog-shadow` | `var(--shadow-xl)` | H (most elevated of the three overlays) |
| `--p-dialog-background` | `var(--color-30)` | H |
| `--p-dialog-border-color` | `var(--color-border)` | S — `.wui-modal-dialog` has no visible outer border, only internal header/footer dividers |
| `--p-dialog-color` | `var(--color-text-primary)` | H |
| `--p-dialog-content-padding` | `var(--space-2)` | H (`.wui-modal-body`, intentionally smaller than header/footer padding) |
| `--p-dialog-header-padding` | `var(--space-3)` | H |
| `--p-dialog-title-font-weight` | `var(--font-semibold)` | H |
| `--p-dialog-title-font-size` | `var(--text-md)` | H |
| `--p-dialog-footer-padding` | `var(--space-4) var(--space-5)` | H |
| `--p-dialog-footer-gap` | `var(--space-2)` | H |
| `--p-dialog-header-gap` | `var(--space-3)` | H — `.wui-modal-header`'s own `gap`, distinct property from its `padding` (same token value, different property; not a copy-paste) |

Notable: `dismissableMask` defaults to `false` on modal PrimeNG dialogs — clicking the dimmed
backdrop does **not** close it (confirmed correct default behavior in the report, not a
regression). Esc and the header close (X) button do close it.

### 4.3 Drawer

- Import/selector: `import { Drawer } from 'primeng/drawer';` → `<p-drawer header="..."
  [(visible)]="drawerVisible" position="right">`.
- Mapped against `CSS/weoc-ui/weoc-overlays.css`'s `.wui-drawer-panel/-header/-title/-body/-footer`.

| Token | Value | Src |
|---|---|---|
| `--p-drawer-background` | `var(--color-30)` | H |
| `--p-drawer-color` | `var(--color-text-primary)` | H |
| `--p-drawer-border-color` | `var(--color-border)` | S — panel itself has no outer border, only header/footer internal dividers (same rationale as Dialog's border-color) |
| `--p-drawer-shadow` | `var(--shadow-lg)` | H (third distinct elevation tier — Popover=md, Dialog=xl, Drawer=lg) |
| `--p-drawer-content-padding` | `var(--space-2)` | H |
| `--p-drawer-header-padding` | `var(--space-4) var(--space-5)` | H (two-value; confirmed different from Dialog's single-value `--space-3`) |
| `--p-drawer-footer-padding` | `var(--space-4) var(--space-5)` | H |
| `--p-drawer-title-font-weight` | `var(--font-semibold)` | H |
| `--p-drawer-title-font-size` | `var(--text-md)` | H |

No `--p-drawer-border-radius` is set: PrimeNG's Drawer CSS has no such token at all (a drawer
sits flush against a screen edge), so none was invented.

### 4.4 Button

The largest surface bridged: **129 unique `--p-button-*` declarations**, all `!important`.
Import/selector: `import { Button } from 'primeng/button';` → `<p-button label="..."
severity="..." [outlined]="true" [text]="true">`. Mapped against the already-ported
`angular/packages/weoc-ui-css/components/buttons.css`.

**Shared (21 tokens, not per-severity)** — sourced from `.wui-btn`, `:focus-visible`,
`.wui-btn-sm`, `.wui-btn-lg`:

| Token | Value | Src |
|---|---|---|
| `--p-button-border-radius` | `var(--border-radius)` | H |
| `--p-button-padding-x` / `-padding-y` | `var(--space-3)` / `var(--space-1)` | H |
| `--p-button-font-size` | `var(--text-base)` | H |
| `--p-button-label-font-weight` | `var(--font-regular)` | H |
| `--p-button-gap` | `var(--space-xs)` | H |
| `--p-button-icon-only-width` | `2.375rem` | H — literal, `.wui-btn.icon-only`'s real width/height, no weoc-ui rem token lands exactly here |
| `--p-button-transition-duration` | `0.15s` | H — literal, no `--duration-*` token exists |
| `--p-button-focus-ring-width/-style/-offset` | `2px` / `solid` / `2px` | H |
| `--p-button-sm-font-size/-padding-x/-padding-y` | `var(--text-sm)` / `var(--space-2)` / `var(--space-1)` | H |
| `--p-button-sm-icon-only-width` | `1.9375rem` | H — literal, `.wui-btn-sm.icon-only` |
| `--p-button-lg-font-size/-padding-x/-padding-y` | `var(--text-lg)` / `var(--space-4)` / `var(--space-2)` | H |
| `--p-button-lg-icon-only-width` | `3rem` | H — literal, `.wui-btn-lg.icon-only` |
| `--p-button-rounded-border-radius` | `var(--radius-pill)` | S — "rounded" has no wui-btn modifier of its own; reuses weoc-ui-css's existing pill-shape token (`.wui-fab-extended`) |
| `--p-button-raised-shadow` | `var(--shadow-md)` | S — "raised" has no wui-btn modifier; reuses the same elevation token as Popover |

**Per-severity (108 tokens = 3 style families × 6 severities: primary, secondary, success, info,
warn, danger).** Solid = 11 tokens/severity (background/border-color/color, hover.\*, active.\*,
focus.ring.\*); Outlined = 4 tokens/severity (color, border-color, hover.background,
active.background); Text = 3 tokens/severity (color, hover.background, active.background).

*Naming mismatch, called out once:* PrimeNG spells the sixth severity `warn`
(`--p-button-warn-*`); weoc-ui spells the same color `warning` (`.wui-btn.warning`,
`--color-warning*`). Every `--p-button-warn-*` / `-outlined-warn-*` / `-text-warn-*` declaration
is intentionally filled from weoc-ui's `warning` tokens — a deliberate translation, not a
dropped severity.

*Solid family* (source `.wui-btn.{color}`), one representative row per severity — hover/active
reuse the resting value for every severity except `secondary` (see structural note below):

| Severity | background / border-color / color | Src |
|---|---|---|
| primary | `var(--color-10)` / `var(--color-10)` / `var(--color-on-accent)` | H |
| secondary | `var(--color-60)` / `var(--color-border)` / `var(--color-text-ui)`; **hover/active** `var(--color-border)` bg+border, `var(--color-text-primary)` color | H — the one severity with a real distinct `:hover` |
| success | `var(--color-success)` / `var(--color-success)` / `var(--color-on-accent)` | H |
| info | `var(--color-info)` / `var(--color-info)` / `var(--color-on-accent)` | H |
| warn | `var(--color-warning)` / `var(--color-warning)` / `var(--color-on-accent)` | H (name-mapped, see above) |
| danger | `var(--color-danger)` / `var(--color-danger)` / `var(--color-on-accent)` | H |

Focus ring per severity: `focus-ring-color` = each severity's own color var (e.g.
`--p-button-primary-focus-ring-color: var(--color-10)`), `focus-ring-shadow: none` for all six
— the `none` is an **exact match** (Aura's own preset sets `focusRing.shadow: "none"` for every
severity, and `wui-btn` is outline-only with no box-shadow), while extending the per-severity
*color* to primary/secondary specifically is an extrapolation from `wui-btn`'s
`neon-outline`-variant convention (which only defines per-color focus outlines for
danger/success/warning/info), not a literal 1:1 source for those two.

*Outlined family* (source `.wui-btn.outline.{color}`), `color` / `border-color` /
`hover.background` (= `active.background`, no distinct outline `:active` rule exists):

| Severity | color / border-color / hover+active background |
|---|---|
| primary | `var(--color-10)` / `var(--color-10)` / `var(--color-10-light)` |
| secondary | `var(--color-text-secondary)` / `var(--color-secondary-muted)` / `var(--color-secondary-light)` |
| success | `var(--color-success-text)` / `var(--color-success-muted)` / `var(--color-success-light)` |
| info | `var(--color-info-text)` / `var(--color-info-muted)` / `var(--color-info-light)` |
| warn | `var(--color-warning-text)` / `var(--color-warning-muted)` / `var(--color-warning-light)` |
| danger | `var(--color-danger-text)` / `var(--color-danger-muted)` / `var(--color-danger-light)` |

All H. Note: PrimeNG's `outlined.*` set has no hover/active border-color token at all — only
`color`, `border.color`, `hover.background`, `active.background` exist — so the hover
border-color intensification `.wui-btn.outline` does in source (muted → full) cannot be bridged;
only the background-fill half is.

*Text family* (source `.wui-btn.ghost.{color}` — "ghost" is weoc-ui's closest match to PrimeNG's
Text style, not a literal name match), `color` / `hover.background` (= `active.background`):

| Severity | color / hover+active background |
|---|---|
| primary | `var(--color-10)` / `var(--color-10-light)` |
| secondary | `var(--color-text-secondary)` / `var(--color-secondary-light)` |
| success | `var(--color-success-text)` / `var(--color-success-light)` |
| info | `var(--color-info-text)` / `var(--color-info-light)` |
| warn | `var(--color-warning-text)` / `var(--color-warning-light)` |
| danger | `var(--color-danger-text)` / `var(--color-danger-light)` |

All H.

**U — intentionally out of scope, do not add:** `button.help.*`, `button.contrast.*` (Aura-only
severities, no weoc-ui color), `button.outlined.plain.*`, `button.text.plain.*` (neutral
variants, no weoc-ui color), `button.link.*` (underline-link style, no equivalent),
`button.badge.size` (no wui-btn badge concept).

**Structural mismatches (apply across every solid severity, documented once):**
1. `wui-btn`'s hover is `filter: brightness(N)` for five of six severities (not `secondary`) — a
   dt() token can't hold a filter, so hover/active reuse the resting color for those five.
2. `wui-btn:focus-visible` always outlines `--color-10` regardless of severity on the base
   button; the per-severity focus convention is extrapolated from the `neon-outline` variant
   (see above).

### 4.5 ConfirmDialog

The smallest surface: **6 tokens**, all layered on top of Dialog's already-bridged container
(background/border/shadow/header/footer/buttons all inherited free — ConfirmDialog renders into
`.p-dialog` markup). Import/selector: `import { ConfirmDialog } from 'primeng/confirmdialog';` →
`<p-confirmdialog />` (lowercase selector — `<p-confirmDialog />` camelCase fails Angular's
template compiler in this PrimeNG version, 22.0.6; corrected during implementation). Backed by
`ConfirmationService` (`primeng/api`), provided app-wide in `app.config.ts`, and needed
separately in any component's own `TestBed` providers if that component injects it (a Jest
`NG0201: No provider found` was hit and fixed for exactly this reason).

**Architecturally notable — honesty case study:** unlike every other component, **none of these
6 tokens has a hard 1:1 source.** weoc-ui's own confirm modal (`WUI.confirm()`'s
`buildConfirmModal` in repo-root `JS/weoc-ui.js`) renders no icon element at all, and its message
`<p>` carries no inline style or class. Every value below is either a soft default (nothing to
source from) or an inferred default (derived from what actually renders via CSS inheritance) —
never copied from an explicit rule.

| Token | Value | Src |
|---|---|---|
| `--p-confirmdialog-content-gap` | `var(--space-3)` | S — no icon exists to measure an icon-to-message gap from; reuses the same rhythm value as Dialog's header/footer spacing |
| `--p-confirmdialog-icon-color` | `var(--color-warning)` | S — no icon exists in source; chosen for semantic fit with a confirm/warning prompt (same token Button already maps to PrimeNG's `warn`) |
| `--p-confirmdialog-icon-size` | `var(--icon-lg)` | S — same reasoning as icon-color |
| `--p-confirmdialog-message-color` | `var(--color-text-primary)` | Inferred — message `<p>` and `.wui-modal-body` set no color; it inherits from `body { color: var(--color-text-primary) }` in `weoc-reset.css` |
| `--p-confirmdialog-message-font-weight` | `var(--font-regular)` | Inferred — no font-weight rule anywhere in the chain; matches the browser's normal-weight rendered default |
| `--p-confirmdialog-message-font-size` | `var(--text-base)` | Inferred, **corrected during this task** from an initially suggested `--text-sm` after tracing the real cascade (see §3.5 lesson) |

Also required installing `primeicons` (not previously in the repo) so the `pi
pi-exclamation-triangle` icon class actually renders a glyph — without it, verifying
`--p-confirmdialog-icon-color` visually would have been dishonest (asserting a color renders when
nothing is visible).

### 4.6 Toast

The first — and so far only — bridge that is **not** a pure token override. Import/selector:
`import { Toast } from 'primeng/toast';` → `<p-toast />`, backed by `MessageService`
(`primeng/api`), `this.messageService.add({ severity, summary, detail })`.

**The architecture mismatch:** PrimeNG gives every severity (normal/info/warn/error/success/
secondary/contrast) its own distinct background/border-color/color/detail-color/shadow — a
"solid tinted card per severity" design (Aura's `success` is mint-tinted, `error` is
red-tinted, etc.). weoc-ui's toast (`CSS/weoc-ui/weoc-feedback.css` section 5) is the opposite:
every severity shares one neutral card (`background: var(--color-30); border: 1px solid
var(--color-border)`), and severity shows only as a colored left accent rail
(`border-inline-start`, color from a per-severity `--_accent` custom property) plus a matching
icon color. Title/message text colors are the same neutral pair for every severity, never
tinted. A pure token override can flatten the tint (set every severity's tokens to the same
neutral value) but cannot add the rail back — PrimeNG has no token slot for "a rail on an
otherwise neutral card." Solved with two tiers:

**Tier 1** (inside `:root`, `!important`, same mechanism as every other block) — shared
structural tokens plus every severity set to identical neutral values:

| Token | Value | Src |
|---|---|---|
| `--p-toast-border-radius` | `var(--border-radius)` | H |
| `--p-toast-border-width` | `1px` | H — literal, `.wui-toast`'s own all-sides border (distinct from the thicker `--border-sm` rail, which is Tier 2 only) |
| `--p-toast-content-gap` | `var(--space-3)` | H |
| `--p-toast-content-padding` | `var(--space-3) var(--space-4)` | H |
| `--p-toast-icon-margin` | `1px 0 0 0` | H — literal, `.wui-toast-icon`'s own `margin-top: 1px` |
| `--p-toast-icon-size` | `var(--text-lg)` | H |
| `--p-toast-text-gap` | `2px` | H — `.wui-toast-body`'s own `gap: 2px`, a bonus exact match beyond the original token list |
| `--p-toast-summary-font-size/-weight` | `var(--text-xs)` / `var(--font-semibold)` | H |
| `--p-toast-detail-font-size/-weight` | `var(--text-xs)` / `var(--font-medium)` | H |
| `--p-toast-close-button-width/-height` | `var(--icon-lg)` | H |
| `--p-toast-close-button-border-radius` | `var(--radius-sm)` | H |
| `--p-toast-close-icon-size` | `var(--icon-sm)` | H |
| `--p-toast-{normal,info,warn,error,success}-background` | `var(--color-30)` (all five, identical) | H — deliberately identical, this inversion of Aura's per-severity tinting IS the point |
| `--p-toast-{severity}-border-color` | `var(--color-border)` (all five) | H |
| `--p-toast-{severity}-color` | `var(--color-text-primary)` (all five) | H |
| `--p-toast-{severity}-detail-color` | `var(--color-text-secondary)` (all five) | H |
| `--p-toast-{severity}-shadow` | `var(--shadow-lg)` (all five) | H |

**U:** `toast.secondary.*`, `toast.contrast.*` (no weoc-ui equivalent); `toast.width`,
`toast.blur` (weoc-ui's card is fully opaque, blur has no visible effect); per-severity
close-button hover/focus-ring tokens (weoc-ui's `.wui-toast-close:hover` uses one neutral color
for every severity, no distinct source to justify five overrides).

**Tier 2** (plain CSS, outside `:root`, **no `!important`** — new selectors, nothing to
out-cascade) — targets PrimeNG's own real classes directly, confirmed in
`node_modules/primeng/fesm2022/primeng-toast.mjs`:

```css
.p-toast-message-success .p-toast-message-content { border-inline-start: var(--border-sm) solid var(--color-success-text); }
.p-toast-message-error   .p-toast-message-content { border-inline-start: var(--border-sm) solid var(--color-danger-text); }
.p-toast-message-warn    .p-toast-message-content { border-inline-start: var(--border-sm) solid var(--color-warning-text); }
.p-toast-message-info    .p-toast-message-content { border-inline-start: var(--border-sm) solid var(--color-info-text); }
.p-toast-message-normal  .p-toast-message-content { border-inline-start: var(--border-sm) solid var(--color-10); }
```

PrimeNG's `normal` (default/no-severity case) maps to weoc-ui's primary accent (`--color-10`).

### 4.7 Tabs

Import/selector: `import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';` →
`<p-tabs value="0"><p-tablist><p-tab value="0">...</p-tab></p-tablist><p-tabpanels><p-tabpanel
value="0">...</p-tabpanel></p-tabpanels></p-tabs>`. This is the composable `Tabs` API, **not**
the older `TabView`/`primeng/tabview` — confirmed by reading
`node_modules/primeng/fesm2022/primeng-tabs.mjs`. Mapped against `.wui-hdr-tabs`/`.wui-hdr-tab`
(`CSS/weoc-ui/weoc-navigation.css`) and `.wui-tab-panel` (`CSS/weoc-ui/weoc-layout.css`).

Simplest component in the series: one visual identity, no per-severity multiplication, and a
pure token-override bridge end to end (no Tier 2 needed, unlike Toast).

| Token | Value | Src |
|---|---|---|
| `--p-tabs-tablist-background` | `var(--color-30)` | H |
| `--p-tabs-tablist-border-color` | `var(--color-border)` | H |
| `--p-tabs-tablist-border-width` | `1px` | H — literal, no dedicated border-width token |
| `--p-tabs-tab-background` | `transparent` | H — hard-sourced **absence**: `.wui-hdr-tab` sets no background in any state |
| `--p-tabs-tab-color` | `var(--color-text-secondary)` | H |
| `--p-tabs-tab-border-color` | `transparent` | H |
| `--p-tabs-tab-border-width` | `0 0 2px 0` | H — bottom-only shorthand mirroring Aura's own `"0 0 1px 0"` convention, matches `border-bottom: 2px solid transparent` |
| `--p-tabs-tab-padding` | `var(--space-sm) var(--space-3)` | H |
| `--p-tabs-tab-margin` | `0` | H — hard-sourced absence (no margin rule; adjacent spacing comes from padding only) |
| `--p-tabs-tab-gap` | `var(--space-2)` | H |
| `--p-tabs-tab-font-size/-weight` | `var(--text-xs)` / `var(--font-bold)` | H |
| `--p-tabs-tab-hover-background` | `transparent` | H |
| `--p-tabs-tab-hover-color` | `var(--color-text-primary)` | H |
| `--p-tabs-tab-hover-border-color` | `transparent` | H — hover only changes `color`, never `border-bottom-color` (that's `.active`'s job) |
| `--p-tabs-tab-active-background` | `transparent` | H |
| `--p-tabs-tab-active-color` / `-active-border-color` | `var(--color-10)` (both) | H |
| `--p-tabs-tab-focus-ring-width/-style/-color/-offset` | `2px` / `solid` / `var(--color-10)` / `2px` | Extrapolated — `.wui-hdr-tab` has no own `:focus-visible` rule; extends weoc-ui's one global `button:focus-visible` convention in `weoc-reset.css` |
| `--p-tabs-tab-focus-ring-shadow` | `none` | H — matches the outline-only convention |
| `--p-tabs-active-bar-background` | `var(--color-10)` | H — see structural note below |
| `--p-tabs-active-bar-height` | `2px` | H |
| `--p-tabs-active-bar-bottom` | `0` | H — no literal offset source (no separate indicator element); `0` sits flush with the tab's own border, deliberately NOT Aura's `-1px` default (which exists only for Aura's own border-overlap trick) |
| `--p-tabs-tabpanel-background` | `transparent` | H — absence-is-the-fact, same pattern as tab.background |
| `--p-tabs-tabpanel-color` | `var(--color-text-primary)` | Inferred — no own color rule, inherits from `body` |
| `--p-tabs-tabpanel-padding` | `0` | H — literal |
| `--p-tabs-transition-duration` | `0.15s` | H — literal, matches `.wui-hdr-tab`'s own transition, no dedicated duration token |

*Structural note on the active bar:* PrimeNG's active-tab indicator is a real, separate sliding
DOM element (`.p-tablist-active-bar`); weoc-ui's `.wui-hdr-tab.active` has no such element, it
just flips its own `border-bottom-color`. Despite the structural difference, PrimeNG's token
slots already express the exact visual result wanted — this is the **opposite** of Toast's rail
problem (a slot existed here; Toast had none), so no CSS override was needed.

**U:** `tabs.nav.button.*` (scroll-arrow buttons on tablist overflow — `.wui-hdr-tabs` is plain
`overflow-x: auto; scrollbar-width: none`, no arrow control; the separate `.wui-fab.tabs-scroll-*`
buttons elsewhere in weoc-ui are a bolted-on board-specific JS feature, not base tab-strip style,
and have no dt() token regardless); `tabs.tabpanel.focus.ring.*` (`.wui-tab-panel` is a content
region, not interactive, no focus-visible rule exists).

**Gotcha unrelated to the CSS bridge itself:** adding `<p-tabs>` to the demo broke `ng test
demo` — PrimeNG's `TabList.bindResizeObserver()` calls `new ResizeObserver(...)` in
`ngAfterViewInit`, which jsdom (Jest's DOM env) doesn't implement, throwing `ReferenceError:
ResizeObserver is not defined`. Fixed with a minimal `ResizeObserverStub` (no-op
observe/unobserve/disconnect) added to the shared `angular/setup-jest.ts` via `??=` (fills the
gap only, never shadows a real implementation). Anyone adding Tabs to a project's Jest suite for
the first time will hit this and needs the same polyfill.

### 4.8 Menu

Import/selector: `import { Menu } from 'primeng/menu';` → `<p-menu #menu [popup]="true"
[model]="menuItems" />`, `menu.toggle($event)` (same toggle-via-template-ref pattern as Popover).
weoc-ui has no separate "select-style dropdown" component distinct from a popover-anchored
action list, so PrimeNG's Menu is mapped onto weoc-ui's `.wui-dropdown`/`.wui-dropdown-item`/
`.wui-dropdown-item-icon` (`CSS/weoc-ui/weoc-overlays.css` section 2).

| Token | Value | Src |
|---|---|---|
| `--p-menu-background` | `var(--color-30)` | H |
| `--p-menu-color` | `var(--color-text-primary)` | H — container has no own `color`, reused for inheritance consistency (e.g. custom item templates) |
| `--p-menu-border-color` | `var(--color-border)` | H |
| `--p-menu-border-radius` | `var(--border-radius)` | H |
| `--p-menu-shadow` | `var(--shadow-md)` | H (same elevation tier as Popover) |
| `--p-menu-transition-duration` | `0.12s` | H — literal, confirmed distinct from Button/Tabs' `0.15s` by re-reading |
| `--p-menu-list-padding` | `var(--space-1) 0` | H |
| `--p-menu-list-gap` | `0` | H — hard-sourced absence, no inter-item gap property exists |
| `--p-menu-item-padding` | `var(--space-2) var(--space-4)` | H |
| `--p-menu-item-gap` | `var(--space-2)` | H |
| `--p-menu-item-color` / `-icon-color` | `var(--color-text-primary)` (both) | H |
| `--p-menu-item-icon-size` | `var(--text-md)` | H |
| `--p-menu-item-label-font-size` | `var(--text-sm)` | H |
| `--p-menu-item-label-font-weight` | `var(--font-regular)` | Inferred — no font-weight rule anywhere in the cascade, matches the rendered default |
| `--p-menu-item-focus-background` | `var(--color-10-light)` | H (from `.wui-dropdown-item:hover`) |
| `--p-menu-item-focus-color` / `-icon-focus-color` | `var(--color-10)` (both) | H — confirmed PrimeNG's own `menu.item.focus.*` applies to both keyboard focus AND `:hover`, so weoc-ui's single hover rule is the complete 1:1 source, not partial |
| `--p-menu-item-border-radius` | `0` | S — no per-item radius exists (full-width rows, only the host's own radius applies) |
| `--p-menu-separator-border-color` | `var(--color-border)` | S — weoc-ui's dropdown has NO separator element at all; reuses the same neutral divider token other overlays use, since this demo's PrimeNG model adds `{ separator: true }` and needs to look at-home |

**U:** the entire `menu.submenu.*` group (8 tokens: `icon.color`, `icon.focus.color`,
`icon.size`, `label.background`, `label.color`, `label.font.size`, `label.font.weight`,
`label.padding` — real variable prefix is `--p-menu-submenu-*`, namespaced under Menu itself, not
a standalone `--p-submenu-*`). weoc-ui's dropdown has no submenu/nested-menu concept at all.

**Gotcha from this bridge, worth repeating for future editors:** a CSS block comment containing
the literal substring `nav.button.*/tabpanel` (referring to Tabs' token list) has its `*/`
prematurely close the comment, breaking the build with `css-syntax-error`. Any time a bridge
comment needs to reference another component's tokens containing `.* ` followed by more path
segments, add a space to avoid an accidental `*/` sequence.

Menu closes out the 8-component series — it is the last block in
`primeng-weoc-ui-bridge.css`.

---

## 5. Known gaps / explicitly out of scope

- **weoc-ui.js's declarative behavior engine is not needed and not ported.** `data-wui-toggle`,
  `WUI.open`/`WUI.close`/`WUI.anchor`, etc. exist in the original WebEOC JS to give plain HTML
  elements toggle/dismiss/positioning/accessibility behavior. PrimeNG's own components already
  do all of that natively and correctly (confirmed per-component in every bridge report above —
  no custom JS was ever written). This was a deliberate decision made early in the project, not
  an oversight or a deferred task.
- **`weoc-ui-css` (the `angular/` package) currently only has foundation + buttons ported.**
  `angular/packages/weoc-ui-css/` contains `tokens/` (agency-theme, reset, typography, fonts,
  grid, utilities) and `components/buttons.css` only. Everything else this bridge series
  referenced as source material — overlays (modal/drawer/popover-adjacent dropdown), feedback
  (toast), navigation (tabs) — still exists **only** at the WebEOC-era repo root
  (`CSS/weoc-ui/*.css`) and was never ported into the Angular package, because the bridge doesn't
  need it ported — it only needs to read it once as reference while writing token overrides. A
  future bridge for a component whose weoc-ui equivalent doesn't exist yet even at the repo root
  would need that CSS written first; a component whose equivalent exists only at the repo root
  can be bridged exactly as this series did, by reading it as reference without porting it.
- **Not yet bridged in this series:** Select and DatePicker have their own separate stub
  (`select-datepicker.md` in this folder) and are out of scope here. Any other PrimeNG component
  a consuming app actually uses, that isn't one of the 8 covered above, is a candidate for the
  same methodology (§3) — nothing about the approach is specific to these 8.

---

## 6. Quick-start checklist for bridging component #9

1. Read `node_modules/@primeuix/styles/dist/<component>/index.mjs`, grep every `dt('<component>.*')` call. List every real token name — don't guess.
2. Read `node_modules/@primeuix/themes/dist/aura/<component>/index.mjs` for Aura's own defaults (which variants/severities Aura ships, what `!important`-worthy defaults look like).
3. Identify weoc-ui's equivalent component in `CSS/weoc-ui/*.css` at the repo root. Read the whole relevant rule set, not just the properties you expect to need.
4. For each PrimeNG token: find the literal weoc-ui value. If vocabulary doesn't match 1:1 (severity/variant names), state the mapping explicitly in a comment.
5. If PrimeNG has a token weoc-ui has no equivalent for: leave it unset, write why, in a `*** ... ***` header comment block, same style as the rest of the file.
6. If a value needs a soft/inferred default: label it as such in-line, and verify it by tracing the actual cascade (don't let a plausible-sounding guess stand — see the ConfirmDialog font-size lesson in §3.5).
7. If (and only if) weoc-ui has a real visual element PrimeNG's token surface has no slot for: add a Tier-2 plain-CSS rule targeting PrimeNG's own confirmed real class names (verify the class names by reading `node_modules/primeng/fesm2022/primeng-<component>.mjs` first), no `!important`.
8. Write the whole block inside `:root { ... }` in `primeng-weoc-ui-bridge.css`, every declaration `!important`, with a header comment explaining sourcing exactly like the 8 existing blocks.
9. Wire the component into `angular/projects/demo/src/app/app.ts` (import, add to `imports` array, add a minimal template usage — no custom toggle/JS).
10. Serve the demo, visually verify in a real browser (screenshot/computed styles), verify interaction (open/close/hover/keyboard) still works via PrimeNG's own logic, check console for new errors.
11. Run `npx ng test weoc-ui-ng --watch=false` and `npx ng test demo --watch=false`. If a new PrimeNG feature needs a browser API jsdom lacks (à la Tabs' `ResizeObserver`), add a minimal polyfill stub to `angular/setup-jest.ts`, don't skip the test.
