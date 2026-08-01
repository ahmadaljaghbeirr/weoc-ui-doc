# Tabs

[← Index](README.md)

The scrollable tab strip `wui-hdr-tabs` that lives inside a board's sticky header. Every variant is shown with its exact markup. For the surrounding header chrome (`wui-hdr-wrap`) and the status strip (`wui-band-wrap`), see [Navigation](navigation.md).

## wui-hdr-tabs

Tab strip that lives inside `wui-hdr-tabs-wrap` (below `wui-hdr-top`). `wui-hdr-tabs` is a horizontal `overflow-x` scroller with the scrollbar hidden; each `wui-hdr-tab` is uppercase and gains an accent bottom-border when `.active` (and lifts to primary text on hover). The wrap paints fade-out edges via `::before`/`::after`, revealed by adding `.has-left` / `.has-right` when the strip is scrolled.

### Static tab bar — active + hover states

```html
<div class="wui-hdr-wrap" style="width:100%">
  <div class="wui-hdr-inner">
    <div class="wui-hdr-top">
      <div class="wui-hdr-left"><div class="wui-hdr-title">EOC Dashboard</div></div>
      <div class="wui-hdr-right">
        <div class="wui-hdr-actions">
          <button class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">add</span>New</button>
        </div>
      </div>
    </div>
    <!-- wui-hdr-tabs-wrap wraps the scroller and owns the fade edges -->
    <div class="wui-hdr-tabs-wrap">
      <div class="wui-hdr-tabs">
        <!-- Active tab -->
        <button class="wui-hdr-tab active"><span class="material-symbols-outlined">dashboard</span>Overview</button>
        <!-- Resting tabs (hover to preview) -->
        <button class="wui-hdr-tab"><span class="material-symbols-outlined">warning</span>Incidents</button>
        <button class="wui-hdr-tab"><span class="material-symbols-outlined">inventory_2</span>Resources</button>
        <button class="wui-hdr-tab"><span class="material-symbols-outlined">home_work</span>Shelters</button>
        <button class="wui-hdr-tab"><span class="material-symbols-outlined">forum</span>Communications</button>
      </div>
    </div>
  </div>
</div>
```

### Interactive — click to switch tabs and panels (data-wui-demo-run)

A self-contained vanilla click handler toggles the `.active` class between tabs and shows/hides the matching panel. It also demonstrates the `.has-left` / `.has-right` fade-edge classes being toggled from the scroller's scroll position.

```html
<div class="wui-hdr-wrap" style="width:100%">
  <div class="wui-hdr-inner">
    <div class="wui-hdr-top">
      <div class="wui-hdr-left"><div class="wui-hdr-title">Incident Board</div></div>
      <div class="wui-hdr-right">
        <div class="wui-hdr-stats">
          <div class="wui-hdr-stat"><span class="material-symbols-outlined">schedule</span>Live</div>
        </div>
      </div>
    </div>
    <div class="wui-hdr-tabs-wrap" id="tabs-demo-tabswrap">
      <div class="wui-hdr-tabs" id="tabs-demo-tabs">
        <!-- Each tab carries data-tab pointing at a panel id -->
        <button class="wui-hdr-tab active" data-tab="overview"><span class="material-symbols-outlined">dashboard</span>Overview</button>
        <button class="wui-hdr-tab" data-tab="incidents"><span class="material-symbols-outlined">warning</span>Incidents</button>
        <button class="wui-hdr-tab" data-tab="resources"><span class="material-symbols-outlined">inventory_2</span>Resources</button>
        <button class="wui-hdr-tab" data-tab="shelters"><span class="material-symbols-outlined">home_work</span>Shelters</button>
        <button class="wui-hdr-tab" data-tab="comms"><span class="material-symbols-outlined">forum</span>Communications</button>
        <button class="wui-hdr-tab" data-tab="logistics"><span class="material-symbols-outlined">local_shipping</span>Logistics</button>
      </div>
    </div>
  </div>
</div>
<!-- Panels: only the .active one is shown -->
<div style="padding:var(--space-3) var(--space-4);width:100%;box-sizing:border-box">
  <div class="tab-panel active" data-panel="overview">Overview — activation summary and KPIs.</div>
  <div class="tab-panel" data-panel="incidents">Incidents — 47 open across 6 sectors.</div>
  <div class="tab-panel" data-panel="resources">Resources — 312 units deployed.</div>
  <div class="tab-panel" data-panel="shelters">Shelters — 8 of 12 active.</div>
  <div class="tab-panel" data-panel="comms">Communications — 3 channels monitored.</div>
  <div class="tab-panel" data-panel="logistics">Logistics — 5 supply runs in progress.</div>
</div>
```

```js
var wrap  = document.getElementById('tabs-demo-tabswrap');
var strip = document.getElementById('tabs-demo-tabs');
var tabs  = strip.querySelectorAll('.wui-hdr-tab');
var panels = wrap.closest('.wui-demo-preview').querySelectorAll('.tab-panel');

function activate(name) {
  tabs.forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === name);
  });
  panels.forEach(function (p) {
    p.classList.toggle('active', p.getAttribute('data-panel') === name);
  });
}

tabs.forEach(function (t) {
  t.addEventListener('click', function () {
    activate(t.getAttribute('data-tab'));
  });
});

// Fade-edge indicators: reveal ::before/::after via .has-left / .has-right
function syncFades() {
  var maxScroll = strip.scrollWidth - strip.clientWidth;
  wrap.classList.toggle('has-left', strip.scrollLeft > 1);
  wrap.classList.toggle('has-right', strip.scrollLeft < maxScroll - 1);
}
strip.addEventListener('scroll', syncFades);
syncFades();
```
