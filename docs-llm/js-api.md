# JS API

[← Index](README.md)

The `window.WUI` object. Synchronous theme bootstrap, overlay lifecycle, declarative attributes, and custom events.

> **weoc-ui.js must load in &lt;head&gt; before the CSS:** Theme is applied synchronously at parse time via `document.documentElement`. Any later placement causes a FOUC flash.

## Theme API

| Member | Type | Description |
|---|---|---|
| `WUI.getTheme()` | `→ string` | Returns `'light'` or `'dark'` |
| `WUI.setTheme(theme, opts?)` | `void` | Set theme. `opts.persist` (default true) saves to localStorage. Fires `wui:themechange`. |
| `WUI.toggleTheme()` | `void` | Flip current theme and persist. |
| `WUI.nativeTheme` | `boolean` | True on WebEOC Nexus (theme is OS-native). Theme-toggle buttons are auto-hidden when true. |

```js
WUI.getTheme()                        // 'light' | 'dark'
WUI.setTheme('dark')                  // set dark, persist
WUI.setTheme('light', { persist: false }) // set without saving
WUI.toggleTheme()                     // flip + persist

document.documentElement.addEventListener('wui:themechange', e => {
  console.log(e.detail.dark); // true | false
});
```

## Utility Functions

| Method | Description |
|---|---|
| `WUI.ready(fn)` | Run `fn` when DOM is ready (DOMContentLoaded or immediately if already loaded). |
| `WUI.debounce(fn, ms, immediate?)` | Returns a debounced version of `fn`. Optional `immediate` fires on leading edge. |
| `WUI.throttle(fn, ms)` | Returns a throttled version that fires at most once per `ms`. |
| `WUI.afterTransition(el, cb, ms?)` | Run `cb` after CSS transition on `el` ends. Optional fallback `ms`. |
| `WUI.lockScroll()` | Lock body scroll (adds padding to compensate scrollbar). Called automatically by backdrop overlays. |
| `WUI.unlockScroll()` | Restore body scroll. Called automatically on overlay close. |

```js
WUI.ready(() => { console.log('DOM ready'); });

const onResize = WUI.debounce(() => { recalcLayout(); }, 200);
window.addEventListener('resize', onResize);

const onScroll = WUI.throttle(() => { updateHeader(); }, 100);
container.addEventListener('scroll', onScroll);
```

## Section Observer & Refresh

Utilities for reacting to WebEOC `updatesection` DOM refreshes and triggering programmatic section reloads via AJAX.

| Method | Description |
|---|---|
| `WUI.observeSection(target, callback)` | Watch an `updatesection` element for DOM refreshes (WebEOC-triggered or programmatic). Fires `callback()` after each replacement. Returns `{ disconnect }`. |
| `WUI.refreshSection(target, opts?)` | Programmatically refresh a single `updatesection` via jQuery AJAX. Fetches the current view URL, extracts the matching section, swaps `innerHTML`, fires `wui:sectionrefresh`, then calls `opts.done`. Requires jQuery. |

**WUI.observeSection(target, callback)**

| Parameter | Type | Description |
|---|---|---|
| `target` | `Element \| string` | Element or CSS selector pointing to the `updatesection` element. |
| `callback` | `function` | Called after each DOM refresh. No arguments passed. Must be idempotent — WebEOC can fire more than one mutation per refresh cycle. |

Returns `{ disconnect: function }` — call to stop observing. Safe to call multiple times per view for independent sections. Watches both the element (innerHTML swap) and its parent (full element replacement). Uses `childList: true` only — NOT subtree — so JS-driven grandchild mutations (card moves, class toggles, TomSelect inits) never re-trigger.

```js
// Wire up once on page load
$(function () {
  WUI.observeSection('#summary-section', function () {
    initGauges();   // re-reads expression values, updates rings — idempotent
  });

  WUI.observeSection('#record-list', function () {
    initTomSelect();    // destroy-then-reinit
    distributeCards();  // idempotent card distributor
  });
});
```

**WUI.refreshSection(target, opts)**

| Option | Type | Description |
|---|---|---|
| `target` | `Element \| string` | Element or CSS selector. Must have an `id` attribute. |
| `opts.url` | `string` | Fetch URL. Default: `window.location.href`. |
| `opts.data` | `object` | Query params passed to `$.ajax`. Default: `{}`. |
| `opts.before(el)` | `function` | Called before the AJAX fetch. Receives the section element. |
| `opts.done(el)` | `function` | Called after the DOM swap. Receives the section element. |
| `opts.error(xhr, status)` | `function` | Called on AJAX failure. |

Fires `wui:sectionrefresh` on the section element after the swap (`detail.el`). The `MutationObserver` from `observeSection` also fires after the swap — make all re-init callbacks idempotent so double-fire is harmless.

```js
// Manual refresh button
$(document).on('click', '#btn-refresh-summary', function () {
  WUI.refreshSection('#summary-section', {
    before: function (el) { el.classList.add('is-loading'); },
    done: function (el) {
      el.classList.remove('is-loading');
      initGauges();  // also called by observeSection — idempotent is the contract
    },
    error: function (xhr) {
      console.error('Refresh failed:', xhr.status);
    },
  });
});

// Refresh with extra filter params
WUI.refreshSection('#record-list', {
  data: { status: 'Open', priority: 'Critical' },
  done: function () { distributeCards(); },
});
```

**Composition: observer + programmatic refresh**

```js
$(function () {
  // Passive: handles WebEOC's own refresh cycle
  WUI.observeSection('#kpi-section', initKpiGauges);

  // Active: manual trigger on a button
  $(document).on('click', '#refresh-kpi', function () {
    WUI.refreshSection('#kpi-section', { done: initKpiGauges });
    // initKpiGauges will run twice (done + observer) — write it idempotent
  });
});
```

## Overlay Lifecycle

| Method | Description |
|---|---|
| `WUI.open(panel, trigger?)` | Open overlay. Adds `.is-open`, fires `wui:open`, locks scroll if backdrop. |
| `WUI.close(panel)` | Close overlay. Removes `.is-open`, fires `wui:close`, unlocks scroll. |
| `WUI.toggle(panel, trigger?)` | Toggle open/close state. |

```js
const drawer = document.getElementById('my-drawer');
const btn = document.getElementById('open-btn');

WUI.open(drawer, btn);
WUI.close(drawer);
WUI.toggle(drawer, btn);

drawer.addEventListener('wui:open', e => {
  console.log('Opened by', e.detail.trigger);
});
drawer.addEventListener('wui:close', () => {
  console.log('Closed');
});
```

## Toast & Snackbar

Transient notifications, created imperatively. The library builds and tears down the DOM; skinned by `weoc-feedback.css`. See the [Feedback](feedback.md) page for live demos.

| Method | Description |
|---|---|
| `WUI.toast(message, opts?)` | Show a corner toast. Returns a handle `{ el, dismiss }`. Auto-dismisses after `opts.duration` (default 4000 ms; `0` = sticky); pauses while hovered. |
| `WUI.snackbar(message, opts?)` | Bottom-center, single-at-a-time preset with an inline action. A new call replaces the open snackbar. Default duration 6000 ms. |
| `WUI.dismissToast(handle\|el)` | Dismiss one toast by its handle or element. |
| `WUI.dismissToasts()` | Dismiss every live toast and snackbar. |

**opts:** `variant` (`primary`/`info`/`success`/`warning`/`danger`) · `position` (6 corners; toast only) · `duration` (ms, `0`=sticky) · `icon` (material-symbol name, `null` to omit) · `title` · `dismissible` (default true) · `action` (`'Label'` or `{ label, onClick(handle) }`).

```js
// Simple success toast
WUI.toast('Incident #4471 submitted', { variant: 'success' });

// Sticky toast with an Undo action
const t = WUI.toast('Record archived', {
  variant: 'warning',
  duration: 0,
  action: { label: 'Undo', onClick: () => restore() }
});
// t.dismiss();  // dismiss programmatically

// Snackbar (bottom-center, single-at-a-time)
WUI.snackbar('Item deleted', {
  action: { label: 'Undo', onClick: () => undoDelete() }
});

// Listen for the action
document.addEventListener('wui:toast:action', e => {
  console.log('action on', e.detail.toast);
});
```

## Class Helpers

| Method | Description |
|---|---|
| `WUI.setVariant(el, value, group)` | Remove all `group`-prefixed classes from `el`, add `group + value`. Useful for swapping color variants. |
| `WUI.selectOne(items, target, cls)` | Remove `cls` from all `items`, add `cls` to `target`. |
| `WUI.showView(scope, name)` | Show `[data-wui-view="name"]` inside `scope`, hide the rest. |

```js
// Swap variant: e.g. change 'danger' to 'success' on a badge
WUI.setVariant(badge, 'success', 'wui-badge-');

// Make one tab active
const tabs = document.querySelectorAll('.wui-hdr-tab');
tabs.forEach(t => t.addEventListener('click', () => {
  WUI.selectOne(tabs, t, 'active');
}));

// Show a view panel by name
WUI.showView('#board', 'incidents');
// All [data-wui-view] inside #board are hidden except data-wui-view="incidents"
```

## Anchor Positioning

Position a floating element relative to a trigger, with viewport collision detection.

| Option | Type | Default | Description |
|---|---|---|---|
| `side` | `string` | `'bottom'` | `'top' \| 'bottom' \| 'left' \| 'right'` |
| `align` | `string` | `'start'` | `'start' \| 'center' \| 'end'` |
| `gap` | `number` | `4` | px offset from trigger edge |
| `margin` | `number` | `8` | px minimum from viewport edge |

```js
const floating = document.getElementById('my-popover');
const trigger = document.getElementById('trigger-btn');

WUI.anchor(floating, trigger, {
  side: 'bottom',
  align: 'end',
  gap: 8,
  margin: 12
});
```

## Declarative Attributes

Auto-wired by `weoc-ui.js` on `DOMContentLoaded`. All boolean values must use `="true"` or `=""` in WebEOC XML.

| Attribute | Element | Behavior |
|---|---|---|
| `data-wui-toggle="#id"` | Any | Toggle the overlay with the given ID on click. |
| `data-wui-dismiss=""` | Any inside overlay | Close the nearest containing overlay (drawer/modal/popover) on click. |
| `data-wui-backdrop="true"` | Overlay root | Lock scroll + dim background when overlay is open. |
| `data-wui-activate=""` | Clickable card/row | Adds click activation (fires `wui:activate`). Guards against nested controls. |
| `data-wui-group="name"` | Activatable item | Group name for mutual exclusion (only one active at a time within group). |
| `data-wui-active=""` | Activatable item | Initial active state. |
| `data-wui-panel="#id"` | Activatable item | Open this overlay when item is activated. |
| `data-wui-panel-close="#id"` | Any | Collapse a wui-split panel + clear active item on click. |
| `data-wui-collapse=""` | Collapsible header | Toggle `.is-open` on closest `[data-wui-collapsible]`. |
| `data-wui-collapsible` | Collapsible root | Marks a collapsible container. Add `.is-open` to start expanded. |
| `data-wui-segment=""` | Segment item | Segmented control button. Click selects it (fires `wui:select`). |
| `data-wui-value="name"` | Segment item | The value emitted in `wui:select` detail. |
| `data-wui-views="group"` | Segment item | Also call `WUI.showView(group, value)` on select. |
| `data-wui-view="name"` | View panel | Hidden/shown by `WUI.showView`. |
| `data-wui-row=""` | Table/log row | Expandable row: click toggles an inline expansion (fires `wui:rowtoggle`). |
| `data-wui-theme-toggle=""` | Button | Calls `WUI.toggleTheme()` on click. Auto-hidden when `WUI.nativeTheme` is true. |

## Custom Events

| Event | Fired on | detail |
|---|---|---|
| `wui:open` | Overlay element | `{ trigger: Element }` |
| `wui:close` | Overlay element | — |
| `wui:activate` | Activatable item | `{ active: boolean }` |
| `wui:select` | Segment container | `{ value: string }` |
| `wui:viewchange` | View container | `{ value: string }` |
| `wui:rowtoggle` | Row element | `{ open: boolean }` |
| `wui:panelopen` | Split element | — |
| `wui:panelclose` | Split element | — |
| `wui:themechange` | `document.documentElement` | `{ dark: boolean }` |
| `wui:sectionrefresh` | Section element | `{ el: Element }` |
| `wui:toast:show` | Toast element | `{ toast: Element }` |
| `wui:toast:dismiss` | Toast element | `{ toast: Element }` |
| `wui:toast:action` | Toast element | `{ toast: Element }` |

```js
// Listen for segment selection
const bar = document.querySelector('.my-segment-bar');
bar.addEventListener('wui:select', e => {
  console.log('Selected tab:', e.detail.value);
});

// Listen for theme changes
document.documentElement.addEventListener('wui:themechange', e => {
  if (e.detail.dark) loadDarkChartTheme();
  else loadLightChartTheme();
});

// Activatable card events
card.addEventListener('wui:activate', e => {
  if (e.detail.active) openDetailPanel(card.dataset.id);
});
```
