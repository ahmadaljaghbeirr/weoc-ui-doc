# Source Layout

[← Index](README.md)

## ESM core bundle

Source of truth: `build/src/{core,interaction,integration,tables,feedback}/*.js`,
import order defined in `build/src/index.js`.

Built by Rollup + Babel into `JS/weoc-ui.js` (and `.min.js`). **`JS/weoc-ui.js`
is GENERATED — never hand-edit it.** Rebuild with:

```
cd build
npm run build       # → ../JS/weoc-ui.js
npm run build:min   # → ../JS/weoc-ui.min.js
```

## Standalone widget files

**Not** part of the ESM bundle — loaded as separate `<script>` tags after
`weoc-ui.js`, per-view, only where a board actually needs them:

- `JS/wui-charts.js` — `WUI.chart`/`pie`/`donut`/`gauge`/`barRow`
- `JS/weoc-map.js` — `WeocMap` (a **flat global**, not nested under `WUI`)
- `JS/weoc-calendar.js`
- `JS/weoc-anim.js` — `WUIAnim.*` (progress-ring entrance animation, counters)

Boards must load `weoc-ui.js` **before** these — `wui-charts.js` and
`weoc-map.js` both read `window.WUI` at parse time and assume it already
exists.

## CSS barrel

`CSS/weoc-ui/weoc-ui-core.css` — its `@import` list is the single source of
truth for what's bundled vs opt-in. Notably **not** imported there:
`weoc-display-tv.css` (TV/projector scale mode — a board adds that `<link>`
only on the specific view(s) that need it).

## Tests

`node --test` (Node's **built-in** test runner — not Jest, not Mocha), run
from `build/`:

```
cd build
npm test
```

jsdom-based. The pattern every test file follows: load the built bundle into
a fresh jsdom document via `dom.window.eval(readFileSync(bundlePath, 'utf8'))`,
then read `WUI` off `dom.window`. See any file in `build/test/*.test.js` for
the exact boilerplate.
