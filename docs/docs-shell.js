(function () {
  'use strict';

  var NAV = [
    {
      group: 'Getting Started',
      items: [
        { key: 'home', label: 'Introduction', file: null }
      ]
    },
    {
      group: 'Foundations',
      items: [
        { key: 'tokens', label: 'Design Tokens', file: 'tokens.html' },
        { key: 'typography', label: 'Typography', file: 'typography.html' },
        { key: 'grid', label: 'Grid & Flex', file: 'grid.html' }
      ]
    },
    {
      group: 'Components',
      items: [
        { key: 'interactive', label: 'Interactive', file: 'interactive.html' },
        { key: 'indicators', label: 'Indicators', file: 'indicators.html' },
        { key: 'cards', label: 'Cards & Forms', file: 'cards.html' },
        { key: 'forms', label: 'Forms', file: 'forms.html' },
        { key: 'tinymce', label: 'Rich Text', file: 'tinymce.html' },
        { key: 'containers', label: 'Containers', file: 'containers.html' },
        { key: 'layout', label: 'Layout', file: 'layout.html' },
        { key: 'tables', label: 'Tables', file: 'tables.html' },
        { key: 'navigation', label: 'Navigation', file: 'navigation.html' },
        { key: 'overlays', label: 'Overlays', file: 'overlays.html' },
        { key: 'calendar', label: 'Calendar', file: 'calendar.html' },
        { key: 'feedback', label: 'Feedback', file: 'feedback.html' },
        { key: 'progress', label: 'Progress', file: 'progress.html' },
        { key: 'charts', label: 'Charts', file: 'charts.html' },
        { key: 'maps', label: 'Maps', file: 'maps.html' },
        { key: 'tier-colors', label: 'Tier Colors', file: 'tier-colors.html' }
      ]
    },
    {
      group: 'Reference',
      items: [
        { key: 'js-api', label: 'JS API', file: 'js-api.html' },
        { key: 'lists', label: 'EOC Lists', file: 'lists.html' }
      ]
    },
    {
      group: 'Recipes',
      items: [
        { key: 'motion', label: 'Animation', file: 'motion.html' }
      ]
    },
    {
      group: 'Patterns',
      items: [
        { key: 'views', label: 'Board Views', file: 'views.html' }
      ]
    }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var barbaStarted = false;
  var themeHooked = false;
  var swatchHooked = false;
  var swatchStylesInjected = false;

  var THEMES = [
    { id: 'atlas',   label: 'Atlas Blue',  color: '#185fa5' },
    { id: 'crimson', label: 'Crimson',     color: '#9b1c1c' },
    { id: 'emerald', label: 'Emerald',     color: '#166534' },
    { id: 'slate',   label: 'Slate',       color: '#4338ca' },
    { id: 'sand',    label: 'Sand',        color: '#92400e' },
    { id: 'compact', label: 'Compact',     color: '#0e7490' },
    { id: 'airy',    label: 'Airy',        color: '#6d28d9' }
  ];

  function getAgencyThemeLink() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if ((links[i].getAttribute('href') || '').indexOf('agency-theme') !== -1) return links[i];
    }
    return null;
  }

  function ensureSwatchStyles() {
    if (swatchStylesInjected) return;
    swatchStylesInjected = true;
    var s = document.createElement('style');
    s.textContent =
      '.docs-theme-swatches{display:flex;align-items:center;gap:5px;margin-right:4px}' +
      '.docs-theme-swatch{width:18px;height:18px;border-radius:50%;border:2px solid transparent;' +
      'cursor:pointer;padding:0;outline:none;flex-shrink:0;' +
      'transition:transform .15s,border-color .15s,box-shadow .15s}' +
      '.docs-theme-swatch:hover{transform:scale(1.2)}' +
      '.docs-theme-swatch.is-active{border-color:var(--color-text-primary);' +
      'box-shadow:0 0 0 1px var(--color-30);transform:scale(1.1)}';
    document.head.appendChild(s);
  }

  // Palette id → agency-theme file name (atlas = the base file).
  function agencyThemeFile(id) {
    return (!id || id === 'atlas') ? 'agency-theme.css' : 'agency-theme-' + id + '.css';
  }

  function activePalette() {
    return localStorage.getItem('wui-docs-theme') || 'atlas';
  }

  /* The TinyMCE content iframe is a separate document with its OWN copy of the
     agency theme (loaded via content_css). The host swatch swap doesn't touch it,
     so swap the iframe's agency-theme <link> too — keeps the editor content on the
     same palette as the page, live, without re-initialising the editor. */
  function syncTinyMCEPalette() {
    if (!window.tinymce || typeof window.tinymce.get !== 'function') return;
    var file = agencyThemeFile(activePalette());
    window.tinymce.get().forEach(function (ed) {
      try {
        var doc = ed.getDoc && ed.getDoc();
        if (!doc) return;
        var links = doc.querySelectorAll('link[rel="stylesheet"]');
        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href') || '';
          if (/agency-theme[^/]*\.css/.test(href)) {
            links[i].setAttribute('href', href.replace(/agency-theme[^/]*\.css/, file));
          }
        }
      } catch (e) {}
    });
  }

  function loadTheme(id) {
    var link = getAgencyThemeLink();
    if (!link) return;
    var href = link.getAttribute('href');
    var base = href.replace(/agency-theme[^/]*\.css/, '');
    link.href = base + agencyThemeFile(id);
    localStorage.setItem('wui-docs-theme', id);
    document.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-theme-pick') === id);
    });
    syncTinyMCEPalette();   // keep any open editor's iframe on the same palette
  }

  function applyStoredTheme() {
    var saved = localStorage.getItem('wui-docs-theme');
    if (saved && saved !== 'atlas') loadTheme(saved);
  }

  function hookThemeSwatches() {
    if (swatchHooked) return;
    swatchHooked = true;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-pick]');
      if (!btn) return;
      loadTheme(btn.getAttribute('data-theme-pick'));
    });
  }

  function getRoot() {
    var path = window.location.pathname.replace(/\\/g, '/');
    // The index (weoc-ui-docs.html) is the only page at the docs root; every
    // other page lives one level down in the page subfolder. Key off the index
    // filename, NOT a '/docs/' path segment, so the deployed root folder can be
    // named anything (e.g. Shared/docs) without colliding with the subfolder.
    return /weoc-ui-docs\.html$/.test(path) ? './' : '../';
  }

  function getHref(item, root) {
    if (item.file === null) return root + 'weoc-ui-docs.html';
    return root + 'docs/' + item.file;
  }

  function labelFor(key) {
    for (var i = 0; i < NAV.length; i++)
      for (var j = 0; j < NAV[i].items.length; j++)
        if (NAV[i].items[j].key === key) return NAV[i].items[j].label;
    return null;
  }

  function renderHeader(root) {
    var saved = localStorage.getItem('wui-docs-theme') || 'atlas';
    var swatchHtml = '<div class="docs-theme-swatches">';
    for (var t = 0; t < THEMES.length; t++) {
      var th = THEMES[t];
      swatchHtml += '<button class="docs-theme-swatch' + (th.id === saved ? ' is-active' : '') + '"' +
        ' data-theme-pick="' + th.id + '"' +
        ' style="background:' + th.color + '"' +
        ' title="' + th.label + '"></button>';
    }
    swatchHtml += '</div>';
    ensureSwatchStyles();
    return '<div class="wui-hdr-wrap">' +
      '<div class="wui-hdr-inner">' +
        '<div class="wui-hdr-top">' +
          '<div class="wui-hdr-left">' +
            '<a href="' + root + 'weoc-ui-docs.html" class="docs-brand-link">' +
              '<div class="wui-hdr-icon"><span class="material-symbols-outlined">layers</span></div>' +
              '<div>' +
                '<div class="wui-hdr-title">weoc-ui</div>' +
                '<div class="wui-hdr-subtitle">Component Library Reference</div>' +
              '</div>' +
            '</a>' +
          '</div>' +
          '<div class="wui-hdr-right">' +
            '<span class="docs-version wui-badge bordered secondary">v1.0</span>' +
            swatchHtml +
            '<button class="wui-btn ghost secondary wui-btn-sm" data-wui-theme-toggle title="Toggle theme">' +
              '<span class="material-symbols-outlined">dark_mode</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSidebar(activeKey, root) {
    var html = '<nav class="docs-nav">';
    for (var i = 0; i < NAV.length; i++) {
      var group = NAV[i];
      html += '<div class="docs-nav-group">';
      html += '<div class="docs-nav-group-label">' + group.group + '</div>';
      for (var j = 0; j < group.items.length; j++) {
        var item = group.items[j];
        var isActive = item.key === activeKey;
        var href = getHref(item, root);
        html += '<a href="' + href + '" class="docs-nav-item' + (isActive ? ' is-active' : '') + '">' + item.label + '</a>';
      }
      html += '</div>';
    }
    html += '</nav>';
    return html;
  }

  /* Render the persistent chrome (header + sidebar) for a namespace.
     Called on first load AND after every Barba navigation — re-rendering the
     sidebar with the CURRENT root keeps relative links correct across the
     root/docs directory boundary, and refreshes the active item + title. */
  function renderChrome(ns, root) {
    var hdr = document.getElementById('docs-hdr');
    if (hdr) hdr.innerHTML = renderHeader(root);
    var sb = document.getElementById('docs-sidebar');
    if (sb) sb.innerHTML = renderSidebar(ns, root);
    var label = labelFor(ns);
    document.title = (label && ns !== 'home') ? 'weoc-ui — ' + label : 'weoc-ui — Component Library';
    if (window.Alpine && window._docsStoreReady) {
      window.Alpine.store('docs').activePage = ns;
    }
  }

  /* ── On-demand global assets ──────────────────────────────────────────────
     Barba never swaps <head>, so anything a page needs must be present
     site-wide. Inject the add-on CSS (tables/maps/forms) + gsap + barba once.
     Guarded so direct loads that already link them don't double-load. */
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  function ensureCSS(href) {
    var has = false, links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if ((links[i].getAttribute('href') || '').indexOf(href) !== -1) { has = true; break; }
    }
    if (has) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }

  function ensureGlobalAssets(root) {
    var shared = root + '../';
    ['weoc-tables.css', 'weoc-maps.css', 'weoc-forms.css'].forEach(function (f) {
      ensureCSS(shared + 'CSS/weoc-ui/' + f);
    });
    // TomSelect + Flatpickr styles — needed on the Forms page but loaded here
    // site-wide because Barba never re-processes incoming <head> link tags.
    ['tom-select.min.css', 'tom-select-agency.css',
     'flatpickr.min.css', 'flatpickr-agency.css',
     'tinymce-theme.css'].forEach(function (f) {
      ensureCSS(shared + 'CSS/' + f);
    });
    var jobs = [];
    // TinyMCE — fully self-hosted in vendor/tinymce-8.6.0/ (engine + skins/
    // themes/models/icons/plugins all resolve from that folder at runtime).
    // content_css / iframe theming is applied in PAGE_INIT.tinymce.
    if (!window.tinymce)     jobs.push(loadScript(root + 'vendor/tinymce-8.6.0/tinymce.min.js'));
    if (!window.gsap)        jobs.push(loadScript(shared + 'JS/gsap.min.js'));
    if (!window.barba)       jobs.push(loadScript(root + 'vendor/barba.min.js'));
    if (!window.WUICalendar) jobs.push(loadScript(shared + 'JS/weoc-calendar.js'));
    if (!window.TomSelect)   jobs.push(loadScript(shared + 'JS/tom-select.complete.min.js'));
    if (!window.flatpickr)   jobs.push(loadScript(shared + 'JS/flatpickr.min.js'));
    if (!window.uPlot)       jobs.push(loadScript(shared + 'JS/uPlot.iife.min.js'));
    if (!window.EOCLists)    jobs.push(loadScript(shared + 'JS/eoc-lists.js'));
    if (!window.Alpine)      jobs.push(loadScript(root + 'vendor/alpine/cdn.min.js'));
    ensureCSS(shared + 'CSS/uPlot.min.css');
    // Factory wrappers + weoc-anim must load AFTER their respective libraries.
    return Promise.all(jobs).then(function () {
      if (window.Alpine && !window._docsStoreReady) {
        window._docsStoreReady = true;

        window.Alpine.store('docs', {
          // ── Theme ───────────────────────────────────────────────────
          // Mirrors localStorage so x-data blocks can read/react to it.
          // Always mutate via setTheme() — it syncs the <link> and swatches.
          theme: localStorage.getItem('wui-docs-theme') || 'atlas',
          setTheme: function (id) {
            this.theme = id;
            loadTheme(id);
          },

          // ── Active page ─────────────────────────────────────────────
          // Set by renderChrome on every navigation. Use in x-data to
          // conditionally show/hide chrome elements per page.
          activePage: null,

          // ── Page-scoped reactive state ──────────────────────────────
          // PAGE_INIT functions write into page.* for x-data blocks on
          // that page. Alpine destroys element-bound scopes automatically
          // when Barba removes the old container — no manual cleanup needed.
          page: {}
        });

        window.Alpine.start();
      }
      var jobs2 = [];
      if (!window.TomSelectFactory) jobs2.push(loadScript(shared + 'JS/tom-select-factory.js'));
      if (!window.FlatpickrFactory)  jobs2.push(loadScript(shared + 'JS/flatpickr-factory.js'));
      if (!window.WUIAnim)           jobs2.push(loadScript(shared + 'JS/weoc-anim.js'));
      if (!window.WUI || !window.WUI.chart) jobs2.push(loadScript(shared + 'JS/wui-charts.js'));
      return Promise.all(jobs2);
    });
  }

  /* ── Per-page behavior, keyed by namespace ────────────────────────────────
     Lives here (not in page-level inline <script>) so it re-runs after a
     Barba swap, where inline scripts in <body> do NOT re-execute. */
  var PAGE_INIT = {
    home: function () {
      var el = document.getElementById('theme-display');
      if (el && window.WUI) el.textContent = window.WUI.getTheme();
    },
    forms: function () {
      if (window.TomSelectFactory) {
        // Register person renderer BEFORE init so data-render="DocsPersonTmpl" resolves
        TomSelectFactory.registerTemplate('DocsPersonTmpl', {
          option: function (data) {
            return '<div class="ts-person-option">' +
              '<div class="ts-person-name">' + data.text + '</div>' +
              '<div class="ts-person-meta">' + (data.role || '') +
                (data.dept ? ' · ' + data.dept : '') + '</div>' +
            '</div>';
          },
          item: function (data) { return '<div>' + data.text + '</div>'; }
        });
        TomSelectFactory.init();
        var rdTs = TomSelectFactory.get('demo-ts-readonly');
        if (rdTs) rdTs.wrapper.classList.add('is-readonly');
      }
      if (window.FlatpickrFactory) {
        FlatpickrFactory.init();
      }
      // Dependent select demo: rebuild child options when parent changes
      window.docsFilterChild = function (value) {
        var child = document.getElementById('demo-ts-child');
        if (!child) return;
        var map = {
          hazmat: [['chem-spill', 'Chemical Spill'], ['radiation', 'Radiation'], ['gas-leak', 'Gas Leak']],
          fire:   [['structure', 'Structure Fire'], ['wildfire', 'Wildfire'], ['vehicle', 'Vehicle Fire']],
          flood:  [['flash', 'Flash Flood'], ['river', 'River Flood'], ['storm', 'Storm Surge']]
        };
        var pairs = map[value] || [];
        while (child.options.length > 1) child.remove(1);
        pairs.forEach(function (p) {
          var o = document.createElement('option');
          o.value = p[0]; o.text = p[1]; child.appendChild(o);
        });
        var ts = TomSelectFactory.get('demo-ts-child');
        if (ts) { ts.clearOptions(); ts.sync(); ts.clear(true); }
      };
    },
    tinymce: function () {
      if (!window.tinymce) return;
      var sel = '#demo-tinymce';
      if (!document.querySelector(sel)) return;
      // Barba re-enter: tear down any prior editor bound to a now-detached node.
      try { window.tinymce.remove(sel); } catch (e) {}
      // The editor iframe is a separate document, so the agency theme must be
      // loaded INTO it (tokens + Cairo + light/dark) BEFORE our content styling,
      // which consumes those tokens. Load agency-theme.css, NOT weoc-ui-core.css
      // (the core reset's body rules would break the editor content body).
      // Use the ACTIVE palette file so Barba navigation into this page lands on
      // the right palette (no refresh needed). Absolute URLs so they resolve
      // correctly even after Barba navigation.
      var contentCss = [
        new URL('../../CSS/weoc-ui/' + agencyThemeFile(activePalette()), document.baseURI).href,
        new URL('../../CSS/tinymce-content-tokens.css', document.baseURI).href
      ];
      var applyTheme = function (ed) { if (window.WUI) window.WUI.applyTinyMCETheme(ed); };
      window.tinymce.init({
        selector: sel,
        height: 380,
        license_key: 'gpl',       // self-hosted GPL build — suppresses the API-key notice
        // Engine + skin/theme/model/icons/plugins all resolve from the vendored
        // tinymce-8.6.0/ folder automatically (base_url derives from the script src).
        menubar: 'edit view insert format table',
        plugins: 'lists link table code help wordcount autolink',
        toolbar: 'undo redo | blocks | bold italic underline | forecolor | ' +
                 'bullist numlist | link table | blockquote | removeformat | code',
        content_css: contentCss,   // agency stylesheet injected INTO the editor iframe
        branding: false,
        promotion: false,
        // init_instance_callback is the reliable "fully ready" hook — the iframe
        // document exists and content_css has been applied, so the theme sticks.
        init_instance_callback: applyTheme,
        setup: function (ed) {
          // Re-assert on content reloads (setValue, undo to empty, etc.).
          ed.on('SetContent', function () { applyTheme(ed); });
        }
      });
    },
    interactive: function () {
      document.querySelectorAll('.wui-slider-input').forEach(function (input) {
        function update() {
          var min = parseFloat(input.min) || 0;
          var max = parseFloat(input.max) || 100;
          var pct = ((parseFloat(input.value) - min) / (max - min) * 100).toFixed(1) + '%';
          input.style.setProperty('--_fill', pct);
          var container = input.closest('.wui-slider');
          if (container) {
            var display = container.querySelector('.wui-slider-value');
            if (display) display.textContent = input.value;
          }
        }
        input.addEventListener('input', update);
        update();
      });
    },
    calendar: function () {
      if (!window.WUICalendar) return;
      // pick up any [data-wui-calendar] auto-init examples (also runs after Barba nav)
      window.WUICalendar.init();
      var host = document.getElementById('cal-demo');
      if (!host) return;

      // demo events anchored to the current week so the calendar always looks live
      var now = new Date();
      function on(dayOffset, h, m) {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h || 0, m || 0);
      }
      function dayOf(dayOffset) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
        // date-only string → treated as all-day by the component
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      }
      function pad(n) { return n < 10 ? '0' + n : '' + n; }

      var events = [
        { id: 1, title: 'EOC Activation Brief', start: on(0, 9, 0), end: on(0, 10, 0),
          variant: 'tier-3', location: 'Command Room A', status: 'Active',
          attendees: ['Aisha Rahman', 'Samir Khan', 'EOC Duty Officer'],
          description: 'Tier-3 standup: situation overview, resource posture, and action assignments.' },
        { id: 2, title: 'Shelter capacity check', start: on(0, 11, 30), end: on(0, 12, 15),
          variant: 'warning', location: 'Logistics', status: 'In progress',
          description: 'Confirm cot and supply counts across the three reception centres.' },
        { id: 3, title: 'Press statement review', start: on(0, 13, 0), end: on(0, 14, 0),
          variant: 'info', location: 'PIO Desk', status: 'Pending' },
        { id: 4, title: 'Damage assessment sweep', start: on(1, 8, 0), end: on(1, 16, 0),
          variant: 'primary', location: 'Sector 4', status: 'Scheduled',
          attendees: ['Field Team Bravo'], description: 'Full-day structural assessment of the eastern grid.' },
        { id: 5, title: 'Stand-down review', start: on(2, 15, 0), end: on(2, 16, 0),
          variant: 'success', location: 'Command Room A', status: 'Tentative' },
        { id: 6, title: 'Emergency Operations Centre — staffed', start: dayOf(0),
          allDay: true, variant: 'tier-3', status: 'Active',
          description: 'Continuous staffing while the activation is in effect.' },
        { id: 7, title: 'Public holiday', start: dayOf(3), allDay: true, variant: 'secondary' },
        { id: 8, title: 'After-action workshop', start: on(4, 10, 0), end: on(4, 12, 30),
          variant: 'tier-1', location: 'Training Room', status: 'Scheduled', done: false,
          attendees: ['All section chiefs'], description: 'Capture lessons and corrective actions.' },
        { id: 9, title: 'Supply convoy ETA', start: on(-1, 14, 0), end: on(-1, 14, 30),
          variant: 'tier-2', location: 'Gate 2', status: 'Completed', done: true },
        { id: 10, title: 'Overlap demo · briefing', start: on(0, 9, 30), end: on(0, 10, 30),
          variant: 'danger', location: 'Command Room A', status: 'Active' }
      ];

      var cal = window.WUICalendar.create(host, {
        view: 'week',
        events: events,
        actions: [
          { key: 'open',     label: 'Open record', icon: 'open_in_new', variant: 'primary' },
          { key: 'complete', label: 'Mark done',   icon: 'check_circle', variant: 'success' },
          { key: 'delete',   label: 'Delete',      icon: 'delete',      variant: 'danger' }
        ]
      });

      // live readout of emitted events
      var out = document.getElementById('cal-event-log');
      if (out && !host._logHooked) {
        host._logHooked = true;
        function log(msg) { out.textContent = msg; out.classList.remove('is-empty'); }
        host.addEventListener('wui:cal:eventclick', function (e) { log('eventclick → ' + e.detail.event.title); });
        host.addEventListener('wui:cal:slotclick', function (e) {
          log('slotclick → ' + e.detail.date.toLocaleString() + (e.detail.allDay ? ' (all-day)' : ''));
        });
        host.addEventListener('wui:cal:action', function (e) {
          log('action "' + e.detail.action + '" → ' + e.detail.event.title);
          if (e.detail.action === 'complete' && cal) cal.updateEvent(e.detail.event.id, { done: true, status: 'Completed', variant: 'success' });
          if (e.detail.action === 'delete' && cal) cal.removeEvent(e.detail.event.id);
        });
        host.addEventListener('wui:cal:viewchange', function (e) { log('viewchange → ' + e.detail.view); });
        host.addEventListener('wui:cal:navigate', function (e) { log('navigate → ' + cal.getDate().toDateString()); });
      }

      // external "view" buttons demo (drive the calendar from outside its toolbar)
      var extBtns = document.querySelectorAll('[data-cal-ext-view]');
      for (var i = 0; i < extBtns.length; i++) {
        if (extBtns[i]._wired) continue;
        extBtns[i]._wired = true;
        extBtns[i].addEventListener('click', function () { if (cal) cal.setView(this.getAttribute('data-cal-ext-view')); });
      }
    },
    charts: function () {
      if (!window.WUI || !window.WUI.chart) return;

      var now = Math.floor(Date.now() / 1000);

      /* ── Line chart demo ─────────────────────────────────────────────────── */
      var lineEl = document.getElementById('demo-line-chart');
      var lineChart = null;
      if (lineEl) {
        var lineTimes = [], lineA = [], lineB = [];
        for (var i = 0; i < 24; i++) {
          lineTimes.push(now - (23 - i) * 3600);
          lineA.push(Math.round(60 + Math.random() * 30));
          lineB.push(Math.round(40 + Math.random() * 40));
        }
        lineChart = window.WUI.chart(lineEl, {
          type: 'line',
          series: [
            { label: 'Resources Available', color: 'primary' },
            { label: 'Resources Deployed',  color: 'warning' }
          ],
          data:   [lineTimes, lineA, lineB],
          height: 220,
          cursor: true,
          legend: true
        });
        var lineUpdateBtn = document.getElementById('demo-line-update');
        if (lineUpdateBtn && lineChart) {
          lineUpdateBtn.addEventListener('click', function () {
            var newA = [], newB = [];
            for (var j = 0; j < 24; j++) {
              newA.push(Math.round(50 + Math.random() * 40));
              newB.push(Math.round(30 + Math.random() * 50));
            }
            lineChart.update([lineTimes, newA, newB]);
          });
        }
      }

      /* ── Area chart demo ─────────────────────────────────────────────────── */
      var areaEl = document.getElementById('demo-area-chart');
      if (areaEl) {
        var areaTimes = [], areaA = [], areaB = [];
        for (var k = 0; k < 24; k++) {
          areaTimes.push(now - (23 - k) * 3600);
          areaA.push(Math.round(20 + Math.random() * 60));
          areaB.push(Math.round(10 + Math.random() * 30));
        }
        window.WUI.chart(areaEl, {
          type: 'area',
          series: [
            { label: 'Incident Reports', color: 'danger' },
            { label: 'Resolved',         color: 'success' }
          ],
          data:   [areaTimes, areaA, areaB],
          height: 220,
          cursor: true,
          legend: true
        });
      }

      /* ── Bar chart demo ──────────────────────────────────────────────────── */
      var barEl = document.getElementById('demo-bar-chart');
      if (barEl) {
        var barTimes = [], barA = [], barB = [];
        for (var b = 0; b < 12; b++) {
          barTimes.push(now - (11 - b) * 3600);
          barA.push(Math.round(5  + Math.random() * 20));
          barB.push(Math.round(3  + Math.random() * 18));
        }
        window.WUI.chart(barEl, {
          type: 'bar',
          series: [
            { label: 'Incidents Opened', color: 'danger' },
            { label: 'Incidents Closed', color: 'success' }
          ],
          data:   [barTimes, barA, barB],
          height: 220,
          cursor: true,
          legend: true
        });
      }

      /* ── Stepped chart demo ──────────────────────────────────────────────── */
      var steppedEl = document.getElementById('demo-stepped-chart');
      if (steppedEl) {
        var stepTimes = [], stepVals = [];
        var level = 2;
        for (var s = 0; s < 14; s++) {
          stepTimes.push(now - (13 - s) * 3600);
          if (s > 0 && Math.random() > 0.65) {
            level = Math.min(4, Math.max(1, level + (Math.random() > 0.5 ? 1 : -1)));
          }
          stepVals.push(level);
        }
        window.WUI.chart(steppedEl, {
          type: 'stepped',
          series: [
            { label: 'Activation Level', color: 'warning' }
          ],
          data:   [stepTimes, stepVals],
          height: 180,
          cursor: true,
          legend: false
        });
      }

      /* ── Pie chart demo ──────────────────────────────────────────────────── */
      var pieEl = document.getElementById('demo-pie-chart');
      if (pieEl && window.WUI.pie) {
        window.WUI.pie(pieEl, {
          height: 240,
          data: [
            { label: 'Active',    value: 42, color: 'danger' },
            { label: 'Standby',   value: 28, color: 'warning' },
            { label: 'Released',  value: 30, color: 'success' }
          ]
        });
      }

      /* ── Donut chart demo ────────────────────────────────────────────────── */
      var donutEl = document.getElementById('demo-donut-chart');
      if (donutEl && window.WUI.donut) {
        window.WUI.donut(donutEl, {
          height: 240,
          data: [
            { label: 'Personnel',  value: 65, color: 'primary' },
            { label: 'Equipment',  value: 48, color: 'warning' },
            { label: 'Facilities', value: 22, color: 'success' }
          ],
          center: { label: '135', sub: 'Resources' }
        });
      }
    },
    lists: function () {
      if (!window.EOCLists || !window.TomSelect) return;

      // ── Flat list demo — Priority ─────────────────────────────────────────
      var flatSel = document.getElementById('demo-list-flat');
      var flatOut = document.getElementById('demo-list-flat-out');
      var flatChips = document.getElementById('demo-list-flat-chips');
      if (flatSel) {
        EOCLists.populate(flatSel, 'Priority');
        var flatTs = new TomSelect(flatSel, {
          plugins: ['clear_button'],
          placeholder: '— Select priority —',
          allowEmptyOption: true
        });
        var PRIORITY_VARIANTS = { Critical: 'danger', High: 'warning', Medium: 'primary', Low: 'success' };
        flatTs.on('change', function (val) {
          if (flatOut) {
            var v = PRIORITY_VARIANTS[val] || '';
            flatOut.className = val ? 'wui-badge ' + v : 'wui-badge bordered secondary';
            flatOut.textContent = val || 'None';
          }
        });
        // Render all items as badge chips below the select
        if (flatChips) {
          EOCLists.get('Priority').forEach(function (item) {
            var chip = document.createElement('span');
            chip.className = 'wui-badge ' + (PRIORITY_VARIANTS[item.value] || 'secondary');
            chip.textContent = item.text;
            chip.style.cursor = 'pointer';
            chip.addEventListener('click', function () { flatTs.setValue(item.value); });
            flatChips.appendChild(chip);
          });
        }
      }

      // ── Cascading demo — Resource Category → Sub-category ────────────────
      var catSel = document.getElementById('demo-list-cat');
      var subSel = document.getElementById('demo-list-sub');
      var cascadeOut = document.getElementById('demo-list-cascade-out');
      if (catSel && subSel) {
        EOCLists.populate(catSel, 'Resource Category');
        var catTs = new TomSelect(catSel, {
          plugins: ['clear_button'],
          placeholder: '— Select category —',
          allowEmptyOption: true
        });
        var subTs = new TomSelect(subSel, {
          plugins: ['clear_button'],
          placeholder: '— Select category first —',
          allowEmptyOption: true
        });
        subTs.disable();

        function updateCascadeOut(cat, sub) {
          if (!cascadeOut) return;
          cascadeOut.innerHTML = '';
          if (cat) {
            var c = document.createElement('span');
            c.className = 'wui-badge primary';
            c.textContent = cat;
            cascadeOut.appendChild(c);
          }
          if (cat && sub) {
            var arr = document.createElement('span');
            arr.className = 'material-symbols-outlined';
            arr.style.fontSize = '18px';
            arr.style.color = 'var(--color-text-secondary)';
            arr.textContent = 'arrow_forward';
            cascadeOut.appendChild(arr);
            var s = document.createElement('span');
            s.className = 'wui-badge info';
            s.textContent = sub;
            cascadeOut.appendChild(s);
          }
        }

        catTs.on('change', function (val) {
          subTs.clear(true);
          subTs.clearOptions();
          if (val) {
            EOCLists.getChildren('Resource Category', val).forEach(function (item) {
              subTs.addOption({ value: item.value, text: item.text });
            });
            subTs.enable();
            subTs.refreshOptions(false);
            updateCascadeOut(val, null);
          } else {
            subTs.disable();
            updateCascadeOut(null, null);
          }
        });
        subTs.on('change', function (val) {
          updateCascadeOut(catTs.getValue(), val);
        });
      }

      // ── Registry grid — all built-in lists ───────────────────────────────
      var grid = document.getElementById('demo-list-registry-grid');
      if (grid) {
        EOCLists.list().forEach(function (name) {
          var items = EOCLists.get(name);
          var isTree = EOCLists.hasChildren(name);

          var card = document.createElement('div');
          card.className = 'wui-card';
          card.style.cssText = 'min-width:220px;flex:1 1 220px;max-width:320px';

          var hdr = document.createElement('div');
          hdr.className = 'wui-card-hdr';
          hdr.innerHTML =
            '<div class="wui-card-hdr-left">' +
              '<span class="wui-card-label" style="font-size:var(--font-sm)">' + name + '</span>' +
            '</div>' +
            '<div class="wui-card-hdr-right">' +
              '<span class="wui-badge ' + (isTree ? 'info' : 'secondary') + ' bordered" style="font-size:11px">' +
                (isTree ? 'tree' : 'flat') +
              '</span>' +
            '</div>';

          var body = document.createElement('div');
          body.className = 'wui-card-body';
          body.style.cssText = 'padding-top:0;display:flex;flex-direction:column;gap:4px';

          items.slice(0, 5).forEach(function (item) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:var(--space-2)';
            row.innerHTML =
              '<span style="font-size:var(--font-sm);color:var(--color-text-primary)">' + item.text + '</span>' +
              '<code style="font-size:11px;color:var(--color-text-secondary)">' + item.value + '</code>';
            body.appendChild(row);
            if (isTree) {
              var children = EOCLists.getChildren(name, item.value);
              if (children.length) {
                var sub = document.createElement('div');
                sub.style.cssText = 'padding-left:var(--space-3);display:flex;flex-wrap:wrap;gap:4px;margin-bottom:2px';
                children.slice(0, 3).forEach(function (c) {
                  var chip = document.createElement('span');
                  chip.style.cssText = 'font-size:10px;padding:1px 6px;background:var(--color-60);border-radius:var(--radius-full);color:var(--color-text-secondary)';
                  chip.textContent = c.text;
                  sub.appendChild(chip);
                });
                if (children.length > 3) {
                  var more = document.createElement('span');
                  more.style.cssText = 'font-size:10px;color:var(--color-text-secondary)';
                  more.textContent = '+' + (children.length - 3) + ' more';
                  sub.appendChild(more);
                }
                body.appendChild(sub);
              }
            }
          });

          if (items.length > 5) {
            var more = document.createElement('div');
            more.style.cssText = 'font-size:var(--font-xs);color:var(--color-text-secondary);padding-top:var(--space-1)';
            more.textContent = '+ ' + (items.length - 5) + ' more items';
            body.appendChild(more);
          }

          card.appendChild(hdr);
          card.appendChild(body);
          grid.appendChild(card);
        });
      }
    },
    motion: function () {
      if (!window.WUIAnim) return;
      var A = window.WUIAnim;

      // ── ring() demo ──────────────────────────────────────────────────────
      var ring1 = document.getElementById('demo-ring-1');
      var ringPlay = document.getElementById('ring-play');
      var ringReset = document.getElementById('ring-reset');
      if (ring1 && ringPlay) {
        ringPlay.addEventListener('click', function () { A.ring(ring1, 75); });
      }
      if (ring1 && ringReset) {
        ringReset.addEventListener('click', function () { A.ring(ring1, 0, { duration: 0.5 }); });
      }

      // ── sectionEntrance() demo ───────────────────────────────────────────
      var sectionContainer = document.getElementById('demo-section-container');
      var sectionPlay = document.getElementById('section-play');
      function resetSectionRings() {
        if (!sectionContainer) return;
        sectionContainer.querySelectorAll('.wui-progress-ring-fill').forEach(function (fill) {
          fill.style.strokeDashoffset = '326.73';
        });
        sectionContainer.querySelectorAll('.wui-progress-ring-pct').forEach(function (el) {
          el.textContent = '0%';
        });
      }
      if (sectionContainer && sectionPlay) {
        resetSectionRings();
        sectionPlay.addEventListener('click', function () {
          resetSectionRings();
          setTimeout(function () { A.sectionEntrance(sectionContainer); }, 50);
        });
      }

      // ── completion() demo ────────────────────────────────────────────────
      var ringCompletion = document.getElementById('demo-ring-completion');
      var completionPlay = document.getElementById('completion-play');
      var completionReset = document.getElementById('completion-reset');
      if (ringCompletion && completionPlay) {
        completionPlay.addEventListener('click', function () { A.completion(ringCompletion); });
      }
      if (ringCompletion && completionReset) {
        completionReset.addEventListener('click', function () {
          A.ring(ringCompletion, 50, { duration: 0.5 });
        });
      }

      // ── counter() demo ───────────────────────────────────────────────────
      var ctr1 = document.getElementById('demo-counter-1');
      var ctr2 = document.getElementById('demo-counter-2');
      var ctr3 = document.getElementById('demo-counter-3');
      var ctrPlay = document.getElementById('counter-play');
      function resetCounters() {
        if (ctr1) ctr1.textContent = '0';
        if (ctr2) ctr2.textContent = '0';
        if (ctr3) ctr3.textContent = '0%';
      }
      if (ctrPlay) {
        ctrPlay.addEventListener('click', function () {
          resetCounters();
          if (ctr1) A.counter(ctr1, 0, 142, { duration: 0.9 });
          if (ctr2) A.counter(ctr2, 0, 117, { duration: 0.9 });
          if (ctr3) A.counter(ctr3, 0, 83, { duration: 0.9, suffix: '%' });
        });
      }

      // ── bar() demo ───────────────────────────────────────────────────────
      var bar = document.getElementById('demo-bar');
      function wireBar(id, pct) {
        var btn = document.getElementById(id);
        if (btn && bar) btn.addEventListener('click', function () { A.bar(bar, pct); });
      }
      wireBar('bar-play-40', 40);
      wireBar('bar-play-75', 75);
      wireBar('bar-play-100', 100);
      var barReset = document.getElementById('bar-reset');
      if (barReset && bar) {
        barReset.addEventListener('click', function () { A.bar(bar, 0, { duration: 0.4 }); });
      }
    },
    views: function () {
      // interactive zone demos mount here via DocShell.mount()
    }
  };

  function runPageInit(ns) {
    if (PAGE_INIT[ns]) { try { PAGE_INIT[ns](); } catch (e) {} }
  }

  /* Live-update the home theme readout on toggle — bound once globally. */
  function hookThemeReadout() {
    if (themeHooked) return;
    themeHooked = true;
    document.documentElement.addEventListener('wui:themechange', function () {
      var el = document.getElementById('theme-display');
      if (el && window.WUI) el.textContent = window.WUI.getTheme();
    });
  }

  /* First-load entrance — stagger the hero + sections. One-shot; Barba
     navigations use the page-fade transition instead. gsap.from so nothing
     gets stuck hidden if gsap somehow fails. */
  function entranceAnimate() {
    if (reduceMotion || !window.gsap) return;
    window.gsap.from('.docs-hero, .docs-section', {
      y: 14, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05
    });
  }

  /* ── Barba — DOC-SITE ONLY ────────────────────────────────────────────────
     Static sidebar + header (outside the wrapper's container); only
     #docs-main swaps, with a barba.js-style fade (out then in). NOTE: this is
     for the documentation site only — NOT a WebEOC pattern. */
  /* The cover panel — a single brand-colored curtain that wipes across the
     content pane. Lives on <body> (persistent), positioned over whatever
     container rect is passed. Token-colored (--color-10). */
  function wipeEl() {
    var el = document.getElementById('docs-wipe');
    if (!el) {
      el = document.createElement('div');
      el.id = 'docs-wipe';
      el.style.cssText =
        'position:fixed;z-index:60;background:var(--color-10);' +
        'transform:scaleX(0);pointer-events:none;will-change:transform';
      document.body.appendChild(el);
    }
    return el;
  }
  function placeWipe(el, target) {
    var r = target.getBoundingClientRect();
    el.style.top = r.top + 'px';
    el.style.left = r.left + 'px';
    el.style.width = r.width + 'px';
    el.style.height = r.height + 'px';
  }

  function startBarba(root) {
    if (barbaStarted || !window.barba) return;
    barbaStarted = true;

    window.barba.init({
      sync: false,   // current leaves fully BEFORE next enters — no two-page overlap
      transitions: [{
        name: 'cover-reveal',
        // Curtain wipes IN left → right over the (sole) current pane.
        leave: function (data) {
          if (reduceMotion) return;
          var el = wipeEl();
          placeWipe(el, data.current.container);
          window.gsap.set(el, { transformOrigin: 'left center', scaleX: 0 });
          return window.gsap.to(el, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' });
        },
        // Barba keeps the OLD container in the DOM (flex) until after enter, so
        // both pages would stack as the curtain slides off. Hide the old one
        // now (barba removes it shortly) so the reveal shows ONLY the new page.
        // The panel HOLDS fully covered (delay) so the swap is painted unseen.
        enter: function (data) {
          var r = getRoot();
          var ns = data.next.namespace;
          if (data.current && data.current.container) data.current.container.style.display = 'none';
          renderChrome(ns, r);
          try { data.next.container.scrollTop = 0; } catch (e) {}
          runPageInit(ns);
          if (reduceMotion) return;
          var el = wipeEl();
          placeWipe(el, data.next.container);
          window.gsap.set(el, { transformOrigin: 'right center', scaleX: 1 });
          return window.gsap.to(el, { scaleX: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.12 });
        }
      }]
    });
  }

  window.DocShell = {
    /* Access the global Alpine store. Returns the 'docs' store object,
       or null if Alpine hasn't initialised yet. */
    store: function () {
      return window.Alpine ? window.Alpine.store('docs') : null;
    },
    init: function (activeKey) {
      var root = getRoot();
      var shared = root + '../';
      var container = document.getElementById('docs-main');
      var ns = activeKey ||
        (container && container.getAttribute('data-barba-namespace')) || 'home';

      // Inject a dedicated link so loadTheme() has a swappable target.
      // weoc-ui-core.css @imports agency-theme internally (resolved at parse time,
      // never a <link> element). This explicit link cascades after that @import,
      // so its :root block wins — and we can swap its href for theme switching.
      ensureCSS(shared + 'CSS/weoc-ui/agency-theme.css');
      applyStoredTheme();
      renderChrome(ns, root);
      hookThemeReadout();
      hookThemeSwatches();

      ensureGlobalAssets(root).then(function () {
        entranceAnimate();
        runPageInit(ns);
        startBarba(root);
      });
    }
  };
})();
