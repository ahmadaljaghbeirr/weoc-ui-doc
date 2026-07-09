# weoc-ui — JS source

Modular source for the weoc-ui behaviour library. **This is the source of truth.**
The deployed file `../../JS/weoc-ui.js` is a GENERATED bundle — do not hand-edit it.

## Build (run from the `build/` folder)

```
npm run build       # src/ -> ../JS/weoc-ui.js  (ES5 IIFE, sourcemap)
npm run build:min   # -> ../JS/weoc-ui.min.js
npm test            # jsdom behavioral gate against the built bundle
```

Pipeline: Rollup bundles the ES modules; `@babel/preset-env` transpiles to the
`.browserslistrc` floor (currently **IE 11** → true ES5). Boards load the built
`weoc-ui.js` from the CDN and use the global `window.WUI`.

## Macro categories (folder = category; load order = import order in `index.js`)

### core/ — foundation
| File | Concern | Deps |
|---|---|---|
| `wui.js` | the `window.WUI` singleton + shared `INTERACTIVE` constant | none |
| `theme.js` | §0 dark/light — **applied synchronously on load** (no FOUC) | WUI |
| `utils.js` | §1 `ready`, `debounce`, `throttle`, `afterTransition`, scroll lock | WUI |
| `dom.js` | §2+§3 `setVariant`, `selectOne`, `anchor` | WUI |

### interaction/ — things the user clicks
| File | Concern | Deps |
|---|---|---|
| `overlays.js` | §4 dismissible overlay lifecycle + `toggle`/`dismiss`/`step` | WUI |
| `activate.js` | §5 activatable card/row + split-panel linkage | WUI, INTERACTIVE |
| `disclosure.js` | §6+§8 inline collapse + expandable log/table row | WUI, INTERACTIVE |
| `segment-view.js` | §7 segmented control / tab bar / view switch | WUI |

### integration/ — WebEOC
| File | Concern | Deps |
|---|---|---|
| `sections.js` | §9 `observeSection` / `refreshSection` (updatesection) | WUI, **jQuery** (refreshSection only) |

### tables/
| File | Concern | Deps |
|---|---|---|
| `sticky-headers.js` | §10 sticky cards `<thead>` transparent→opaque | WUI |

### feedback/
| File | Concern | Deps |
|---|---|---|
| `toast.js` | §11 toast / snackbar | WUI |

## Ordering rules (do not break)

1. **`core/theme.js` runs first among behaviour modules** — its top-level code
   sets `<html data-theme>` while the bundle parses, before first paint. Moving
   it later reintroduces the theme flash.
2. **`core/utils.js` before `disclosure.js` / `sticky-headers.js`** — those call
   `WUI.ready()` at module-load time.
3. Everything else references `WUI.*` only at interaction time, so relative order
   is free.

## Dependency posture

- **Core is dependency-free** and coexists with the page's jQuery.
- `refreshSection` (integration/sections.js) is the **only** helper that hard-requires jQuery.
- Charts (`weoc-charts.js`), calendar, maps, GSAP anim ship as **separate** files
  loaded per-view — not part of this bundle.

## Authoring note

Bodies are ES5 (`var`, function declarations) inherited from the pre-split
monolith. Because Babel transpiles from source, modules MAY be written in modern
syntax once the target browser engine is confirmed. Until then, keep new code
ES5-safe to match the surrounding style.
