// jest-preset-angular 17.x removed the top-level `setup-jest` subpath used by older
// preset versions; the zoneless entry point below matches what this workspace uses
// (no zone.js dependency, no provideZoneChangeDetection() in app.config.ts).
import 'jest-preset-angular/setup-env/zoneless';

// jsdom (Jest's DOM environment) does not implement ResizeObserver. PrimeNG's
// TabList (primeng/tabs, node_modules/primeng/fesm2022/primeng-tabs.mjs
// bindResizeObserver()) instantiates a real `new ResizeObserver(...)` in
// ngAfterViewInit whenever its scroll-arrow nav buttons are shown, which
// throws `ReferenceError: ResizeObserver is not defined` under jsdom and
// fails any test that renders a <p-tabs>/<p-tablist>. This minimal stub only
// needs to satisfy the two methods TabList actually calls (observe/
// unobserve); disconnect is included for completeness since other consumers
// commonly call it too. Global, not test-specific, because the gap is an
// environment limitation (missing browser API), not a behavior to mock per
// test.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as any).ResizeObserver ??= ResizeObserverStub;
