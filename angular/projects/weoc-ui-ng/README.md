# weoc-ui-ng

Angular component library for weoc-ui. Components are thin, standalone wrappers around the
`weoc-ui-css` package's classes and design tokens, not independent visual implementations, so the
library stays visually identical to the rest of weoc-ui with no CSS to duplicate or drift.

## Conventions (mandatory for every component)

- **`input()` signals only.** Never use the `@Input()` decorator. Tests set inputs via
  `fixture.componentRef.setInput(...)`, not by assigning to the component instance directly.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- **`ViewEncapsulation.None`, no `styleUrls`/`styles`.** Components render global classes from
  `weoc-ui-css` (e.g. `wui-btn`); they never own scoped styles. If a component needs a new visual
  class, it belongs in `packages/weoc-ui-css`, not in the component's own stylesheet.

```ts
@Component({
  selector: 'wui-button',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button [class]="hostClasses" [disabled]="disabled()"><ng-content /></button>`,
})
export class WuiButtonComponent {
  color = input<WuiButtonColor>('primary');
  disabled = input(false);
  // ...
}
```

## Components

- **`WuiButtonComponent`** (`wui-button`) — `variant`, `color`, `size`, `disabled`, `dashed`,
  `iconOnly`, `type` inputs; emits `clicked`.
- **`WuiFabComponent`** (`wui-fab`) — floating action button; `color`, `variant`, `extended`
  inputs.

## Building

```bash
npx ng build weoc-ui-ng
```

Output goes to `dist/weoc-ui-ng` (consumed by `demo` via a `tsconfig.json` path mapping).

## Testing

Tests run on **Jest** (via `@angular-builders/jest`), not Karma:

```bash
npx ng test weoc-ui-ng --watch=false
```
