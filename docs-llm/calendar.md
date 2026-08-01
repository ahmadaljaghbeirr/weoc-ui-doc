# Calendar

[← Index](README.md)

A full scheduling surface: **month**, **week**, **day**, and **agenda** views with prev/today/next navigation and a live view switcher. Each slot is an accented, clickable event card that opens a detail popup with configurable actions. CSS is `weoc-calendar.css`; the rendering engine is `weoc-calendar.js` (`window.WUICalendar`).

> **Two files:** The calendar needs `weoc-calendar.css` (bundled in the `weoc-ui-core.css` barrel) and `weoc-calendar.js`. The detail popup reuses `.wui-modal` from the overlays module and, when present, `window.WUI` (weoc-ui.js) for backdrop, Esc, focus-trap, and scroll-lock. No third-party calendar library.

## Live calendar

Switch views with the toolbar segments, page with the arrows, click an event card to open its popup, click an empty slot or day cell to fire `wui:cal:slotclick`. Marking an event *done* or deleting it from the popup mutates the calendar live. This host is instantiated for you by the docs shell; the JavaScript box below is the exact snippet a board would write.

```html
<div id="cal-demo" style="height:640px"></div>
```

### Drive it from outside its toolbar

```html
<!-- External view switches (wired by the shell via data-cal-ext-view) -->
<button class="wui-btn outline secondary wui-btn-sm" data-cal-ext-view="month">Month</button>
<button class="wui-btn outline secondary wui-btn-sm" data-cal-ext-view="week">Week</button>
<button class="wui-btn outline secondary wui-btn-sm" data-cal-ext-view="day">Day</button>
<button class="wui-btn outline secondary wui-btn-sm" data-cal-ext-view="agenda">Agenda</button>
<!-- Open a popup programmatically -->
<button class="wui-btn ghost primary wui-btn-sm" onclick="window.WUICalendar.get('#cal-demo') && window.WUICalendar.get('#cal-demo').openEvent(1)">
  <span class="material-symbols-outlined">open_in_full</span> Open a popup
</button>
```

### Emitted events

The calendar dispatches bubbling `CustomEvent`s on its host element. Last event:

```js
interact with the calendar above…
```

## The four views

One instance, four layouts. The toolbar switcher (`.wui-cal-seg`) is rendered automatically; restrict or reorder it with the `views` option.

```html
              <template class="wui-demo-js">
// restrict the switcher and the navigation step
WUICalendar.create('#cal', { views: ['week', 'day'], view: 'week' });
              </template>
```

## Accent variants

Each event carries one `variant` that sets its accent rail + tint. Six semantic colors plus the four activation tiers. These are static `.wui-cal-event` cards (the compact form used in month cells):

```html
<div class="wui-cal-month" style="border:none">
  <div class="wui-cal-events" style="gap:4px;max-width:280px">
    <!-- Compact (tinted rail) — timed events -->
    <button class="wui-cal-event wui-cal-accent-primary"><span class="wui-cal-event-time">09:00</span><span class="wui-cal-event-title">primary</span></button>
    <button class="wui-cal-event wui-cal-accent-success"><span class="wui-cal-event-time">10:00</span><span class="wui-cal-event-title">success</span></button>
    <button class="wui-cal-event wui-cal-accent-warning"><span class="wui-cal-event-time">11:00</span><span class="wui-cal-event-title">warning</span></button>
    <button class="wui-cal-event wui-cal-accent-danger"><span class="wui-cal-event-time">12:00</span><span class="wui-cal-event-title">danger</span></button>
    <button class="wui-cal-event wui-cal-accent-info"><span class="wui-cal-event-time">13:00</span><span class="wui-cal-event-title">info</span></button>
    <button class="wui-cal-event wui-cal-accent-secondary"><span class="wui-cal-event-time">14:00</span><span class="wui-cal-event-title">secondary</span></button>
    <!-- Solid (filled) — all-day events -->
    <button class="wui-cal-event is-solid wui-cal-accent-tier-1"><span class="wui-cal-event-dot"></span><span class="wui-cal-event-title">tier-1 (all-day / solid)</span></button>
    <button class="wui-cal-event is-solid wui-cal-accent-tier-2"><span class="wui-cal-event-dot"></span><span class="wui-cal-event-title">tier-2 (all-day / solid)</span></button>
    <button class="wui-cal-event is-solid wui-cal-accent-tier-3"><span class="wui-cal-event-dot"></span><span class="wui-cal-event-title">tier-3 (all-day / solid)</span></button>
    <button class="wui-cal-event is-solid wui-cal-accent-tier-4"><span class="wui-cal-event-dot"></span><span class="wui-cal-event-title">tier-4 (all-day / solid)</span></button>
    <!-- Status flags: .is-done (strike) · .is-cancelled (dim + strike) -->
    <button class="wui-cal-event is-done wui-cal-accent-success"><span class="wui-cal-event-time">15:00</span><span class="wui-cal-event-title">done (struck through)</span></button>
    <button class="wui-cal-event is-cancelled wui-cal-accent-secondary"><span class="wui-cal-event-dot"></span><span class="wui-cal-event-title">cancelled</span></button>
  </div>
</div>
```

## Event model

`start`/`end` accept a `Date`, an epoch number, or a string (`YYYY-MM-DD` = all-day, `YYYY-MM-DDTHH:mm` = local time). A bare date with no time is treated as all-day automatically.

```html
              <template class="wui-demo-js">
{
  id: 42,                       // any unique value (auto-generated if omitted)
  title: 'Shelter capacity check',
  start: '2026-06-24T11:30',    // Date | number | ISO-ish string
  end:   '2026-06-24T12:15',    // optional (defaults to +1h, or all-day)
  allDay: false,                // or inferred from a date-only start
  variant: 'warning',           // accent color
  location: 'Logistics',
  status: 'In progress',        // shown as a badge in the popup
  icon: 'inventory',            // optional Material Symbol for the popup band
  attendees: ['A. Rahman', { name: 'S. Khan', role: 'Logistics' }],
  description: 'Confirm cot and supply counts.',
  meta: [ { label: 'Sector', value: '4', icon: 'map' } ],  // extra popup rows
  actions: [ /* override the popup footer for this event */ ],
  done: false,                  // strike-through
  cancelled: false              // dim + strike-through
}
              </template>
```

## Event popup

Clicking any event card opens a popup built into a `.wui-modal`: an accent header band (icon + title + when), detail rows (status badge, location, custom `meta`, attendee chips), the description, and a footer of action buttons. Configure the footer globally with the `actions` option or per event with `event.actions`. Each click emits `wui:cal:action` with `{ action, event }` and closes the popup (set `keepOpen: true` to keep it open).

```html
              <template class="wui-demo-js">
WUICalendar.create('#cal', {
  actions: [
    { key: 'open',     label: 'Open record', icon: 'open_in_new', variant: 'primary' },
    { key: 'complete', label: 'Mark done',   icon: 'check_circle', variant: 'success' },
    { key: 'delete',   label: 'Delete',      icon: 'delete',      variant: 'danger' }
  ]
});

cal.on('action', function (e) {
  routeToWebEOC(e.detail.action, e.detail.event);  // e.g. open an embedview record
});

// open a popup programmatically
cal.openEvent(42);
              </template>
```

> **WebEOC XML constraint:** The popup modal sets `data-wui-backdrop="true"` and `data-wui-dismiss="true"` with explicit values, matching the rest of the library. If you hand-author calendar markup in an XSL view, never use bare boolean attributes.

## Declarative auto-init

Drop `data-wui-calendar` on an element and the engine instantiates it on load (and via `WUICalendar.init()` after any SPA navigation to this page). Seed events inline with a `data-events` JSON array — ideal for WebEOC views that already render their records to JSON.

```html
<!-- Declarative: auto-inits on load; seed events with data-events JSON -->
<div id="cal-auto"
     data-wui-calendar
     data-view="agenda"
     data-events='[
       {"id":"a1","title":"Morning briefing","start":"2026-06-24T08:00","end":"2026-06-24T08:30","variant":"primary","location":"Command Room","status":"Done","done":true},
       {"id":"a2","title":"Resource request review","start":"2026-06-24T10:00","end":"2026-06-24T11:00","variant":"warning","status":"Pending"},
       {"id":"a3","title":"Evening situation report","start":"2026-06-25T17:00","end":"2026-06-25T18:00","variant":"info","location":"PIO Desk"}
     ]'
     style="height:360px"></div>
```

## JS API

### Factory

| Call | Returns |
|---|---|
| `WUICalendar.create(elOrSelector, options)` | instance (idempotent per element) |
| `WUICalendar.get(elOrSelector)` | existing instance or `null` |
| `WUICalendar.init(rootEl?)` | auto-init every `[data-wui-calendar]` |
| `WUICalendar.closePopup()` | close the shared detail popup |

### Instance methods

| Method | Description |
|---|---|
| `cal.setView('month'\|'week'\|'day'\|'agenda')` · `cal.getView()` | switch / read the active view |
| `cal.next()` · `cal.prev()` · `cal.today()` | page the navigation step |
| `cal.setDate(dateOrISO)` · `cal.getDate()` | set / read the focus date |
| `cal.setEvents(array)` · `cal.getEvents()` | replace / read the event array |
| `cal.addEvent(obj)` | append a single event |
| `cal.updateEvent(id, patch)` · `cal.removeEvent(id)` | mutate one event by id |
| `cal.openEvent(id)` · `cal.refresh()` | open the popup / re-render |
| `cal.on(type, handler)` · `cal.off(type, handler)` | subscribe / unsubscribe |
| `cal.destroy()` | tear the instance down |

### Options

| Option | Default | Description |
|---|---|---|
| `view` | `'month'` | initial view |
| `date` | `new Date()` | initial focus date |
| `events` | `[]` | event array |
| `views` | `['month','week','day','agenda']` | switcher entries |
| `weekStartsOn` | `0` | 0 = Sun, 1 = Mon |
| `hourStart` · `hourEnd` | `0` · `24` | timegrid bounds (week/day) |
| `slotHeight` | `48` | px per hour |
| `maxPerDay` | `3` | month chips before "+N more" |
| `locale` | `undefined` | Intl locale (e.g. `'en-GB'`) |
| `hour12` | `true` | 12h vs 24h clock |
| `nowIndicator` | `true` | red current-time line |
| `popup` | `true` | open the built-in popup on event click |
| `defaultVariant` | `'primary'` | fallback accent |
| `actions` | `[]` | popup footer buttons |
| `onEventClick`, `onSlotClick`, `onAction`, `onNavigate`, `onViewChange` | — | callbacks that mirror the CustomEvents |

### Events (bubble on the host element)

| Event | detail |
|---|---|
| `wui:cal:viewchange` | `{ view }` |
| `wui:cal:navigate` | `{ date, view, rangeStart, rangeEnd }` |
| `wui:cal:eventclick` | `{ event, el }` |
| `wui:cal:slotclick` | `{ date, allDay }` |
| `wui:cal:action` | `{ action, event }` |

## Sizing & layout

`.wui-calendar` is `height: 100%` and flex-column: the toolbar is fixed and the active view scrolls inside. Give it a sized parent (an explicit height, a `wui-split-main`, or a `wui-fill-area`). Per-instance knobs are exposed as CSS custom properties:

```html
              <template class="wui-demo-js">
.wui-calendar {
  --wui-cal-slot-h: 48px;      /* px per hour in week/day */
  --wui-cal-gutter-w: 56px;    /* time-label gutter width */
  --wui-cal-min-day-h: 96px;   /* min height of a month cell */
}
/* the JS sets --wui-cal-slot-h from the slotHeight option */
              </template>
```

> **Theme-aware out of the box:** Every color is a token, so the calendar follows `data-theme="dark"` automatically. Try the theme toggle in the header.
