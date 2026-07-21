# weoc-ui Angular workspace

Angular port of weoc-ui, generated with Angular CLI 22. The workspace holds two publishable
packages plus a demo app used to develop and visually verify them:

- **`packages/weoc-ui-css`** — the framework-agnostic CSS layer (design tokens + component
  classes, e.g. `.wui-btn`). Plain CSS, no build step, portable to any markup (Angular, PrimeNG,
  static HTML).
- **`projects/weoc-ui-ng`** — the Angular component library (`weoc-ui-ng`). Every component is a
  thin, standalone wrapper that renders `weoc-ui-css` classes; see
  [`projects/weoc-ui-ng/README.md`](./projects/weoc-ui-ng/README.md) for the library's
  conventions.
- **`projects/demo`** — a throwaway Angular app that imports `weoc-ui-ng` and PrimeNG side by
  side, used to eyeball components and prove that PrimeNG can be restyled with `weoc-ui-css`
  tokens instead of its own theme.

## Building

```bash
npx ng build weoc-ui-ng
```

`demo` consumes the library via a TypeScript path mapping to `./dist/weoc-ui-ng`
(`tsconfig.json`), so build the library at least once before `ng serve demo` or an `ng build` of
the app.

## Testing

The workspace's test runner is **Jest** (via `@angular-builders/jest`), not Karma or Vitest,
regardless of what a stock Angular CLI README says elsewhere. Each project is tested
independently:

```bash
npx ng test weoc-ui-ng --watch=false
npx ng test demo --watch=false
```

`projects/demo/jest.config.js` maps the `weoc-ui-ng` import to the library's TypeScript source
(not the built dist output), so `ng test demo` never requires a fresh library build first.

## Serving

```bash
npx ng serve demo
```

Opens the demo app at `http://localhost:4200/`, reloading on source changes.
