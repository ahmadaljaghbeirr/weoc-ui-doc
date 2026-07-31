(function () {
  'use strict';

  /* Mantine-aligned IA. `kw` = search keywords (component names / synonyms).
     Content-level page rebuilds + new dedicated pages (combobox, dates, …) land
     in phase 2c; for now existing pages are regrouped under the new categories. */
  var NAV = [
    {
      group: 'Get Started',
      items: [
        { key: 'home', label: 'Introduction', file: null, kw: 'intro overview install getting started load order' },
        { key: 'motion', label: 'Animation', file: 'motion.html', kw: 'gsap transition motion weoc-anim ring counter bar' },
        { key: 'js-api', label: 'JS API', file: 'js-api.html', kw: 'WUI api events theme declarative attributes overlay' },
        { key: 'lists', label: 'EOC Lists', file: 'lists.html', kw: 'lists registry cascading tree flat select data' },
        { key: 'localization', label: 'Localization', file: 'localization.html', kw: 'localization i18n language locale rtl arabic translation direction lang toggle' }
      ]
    },
    {
      group: 'Theming',
      items: [
        { key: 'tokens', label: 'Design Tokens', file: 'tokens.html', kw: 'tokens color spacing radius shadow theme palette dark light tier activation 1 2 3 4 emergency accent badge chip status-dot icon-bubble callout banner card lvl' }
      ]
    },
    {
      group: 'Layout',
      items: [
        { key: 'layout', label: 'Layout & Shell', file: 'layout.html', kw: 'appshell page-shell split splitter scroll-area toolbar tab widget dashboard fill-area body-shell board views display input details remove scaffold zone' },
        { key: 'grid', label: 'Grid', file: 'grid.html', kw: 'grid row col group stack simplegrid bento dashboard' },
        { key: 'flex', label: 'Flex', file: 'flex.html', kw: 'flex flexbox gap space justify align wrap direction inline-flex' },
        { key: 'container', label: 'Containers', file: 'container.html', kw: 'container fluid gutter centered max-width bootstrap' }
      ]
    },
    {
      group: 'Inputs',
      items: [
        { key: 'forms', label: 'Text Inputs & Fields', file: 'forms.html', kw: 'textinput input textarea fieldset field-row form-control readonly label' },
        { key: 'cards', label: 'Controls', file: 'cards.html', kw: 'checkbox radio switch slider segmented card-option card-group toggle' }
      ]
    },
    {
      group: 'Combobox',
      items: [
        { key: 'combobox', label: 'Select (TomSelect)', file: 'combobox.html', kw: 'select combobox multiselect autocomplete tags tomselect dropdown pill' }
      ]
    },
    {
      group: 'Buttons',
      items: [
        { key: 'buttons', label: 'Buttons', file: 'buttons.html', kw: 'button btn fab floating action actionicon icon-only extended' }
      ]
    },
    {
      group: 'Navigation',
      items: [
        { key: 'navigation', label: 'Navigation', file: 'navigation.html', kw: 'anchor link band header hdr banner breadcrumbs stepper' },
        { key: 'tabs', label: 'Tabs', file: 'tabs.html', kw: 'tabs tab-panel hdr-tabs strip switcher' }
      ]
    },
    {
      group: 'Feedback',
      items: [
        { key: 'feedback', label: 'Feedback', file: 'feedback.html', kw: 'alert callout banner toast snackbar alarm skeleton empty-state notification' },
        { key: 'loader', label: 'Loader', file: 'loader.html', kw: 'loader busy overlay spinner spin loading data-wui-loading buttonBusy please wait' },
        { key: 'progress', label: 'Progress', file: 'progress.html', kw: 'progress bar ring semicircle segmented percentage' }
      ]
    },
    {
      group: 'Overlays',
      items: [
        { key: 'overlays', label: 'Overlays', file: 'overlays.html', kw: 'modal dialog drawer popover dropdown menu tooltip overlay' }
      ]
    },
    {
      group: 'Data Display',
      items: [
        { key: 'containers', label: 'Cards & Containers', file: 'containers.html', kw: 'card paper plane panel embed collapsible accordion person info-grid datalist' },
        { key: 'interactive', label: 'Badges & Chips', file: 'interactive.html', kw: 'badge chip pill label tag' },
        { key: 'indicators', label: 'Indicators', file: 'indicators.html', kw: 'status-dot indicator level elapsed' },
        { key: 'icons', label: 'Icon Bubbles', file: 'icons.html', kw: 'icon-bubble icon bubble semantic themeicon' },
        { key: 'avatars', label: 'Avatars', file: 'avatars.html', kw: 'avatar identity initials icon avatar-sm avatar-lg avatar-xl' },
        { key: 'tables', label: 'Tables', file: 'tables.html', kw: 'table standard cards log row column sticky sortable' },
        { key: 'heatmap', label: 'Heatmap', file: 'heatmap.html', kw: 'heatmap risk matrix grid cell severity tooltip' }
      ]
    },
    {
      group: 'Dates',
      items: [
        { key: 'dates', label: 'Date & Time (Flatpickr)', file: 'dates.html', kw: 'date datepicker datetime time range flatpickr calendar input' }
      ]
    },
    {
      group: 'Charts',
      items: [
        { key: 'charts', label: 'Charts', file: 'charts.html', kw: 'chart line area bar stepped pie donut uplot timeseries' }
      ]
    },
    {
      group: 'Schedule',
      items: [
        { key: 'calendar', label: 'Calendar', file: 'calendar.html', kw: 'calendar month week day agenda event schedule' }
      ]
    },
    {
      group: 'Typography',
      items: [
        { key: 'typography', label: 'Typography', file: 'typography.html', kw: 'text title heading truncate weight size color mono' },
        { key: 'tinymce', label: 'Rich Text', file: 'tinymce.html', kw: 'tinymce editor rich text wysiwyg content' }
      ]
    },
    {
      group: 'Patterns',
      items: [
        { key: 'maps', label: 'Maps', file: 'maps.html', kw: 'map esri basemap point popover controls location' },
        { key: 'kanban', label: 'Kanban', file: 'kanban.html', kw: 'kanban board task drag drop column card accent' }
      ]
    },
    {
      group: 'Conventions',
      items: [
        { key: 'conventions', label: 'Conventions & Rules', file: 'conventions.html', kw: 'rules inline style viewtype css agency theme device tier breakpoint promotion minimal declarative' },
        { key: 'kpi-recipes', label: 'KPI & Tile Recipes', file: 'kpi-recipes.html', kw: 'kpi dashboard tile recipe template placeholder gauge donut bar-row chart sparkline progress ring wui-tile' }
      ]
    }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Single source of truth for htmx's settle delay (ms), shared by
  // htmxSwapSpec() below (the swap spec actually applied to boosted nav)
  // and scrollToHashTarget()'s deferred-scroll timeout (which has to wait
  // out that same settle window before it's safe to scroll -- see the
  // comment above scrollToHashTarget for why). Keeping this as one
  // constant instead of two independent literals means a future change to
  // the settle timing can't silently desync the two and reintroduce the
  // scroll-lands-then-resets race scrollToHashTarget's defer exists to fix.
  var HTMX_SETTLE_MS = 630;

  // Shared htmx hx-swap spec for every #docs-main navigation (boosted
  // clicks on #docs-split/#docs-hdr, and each individually-attributed
  // search-hit anchor). scroll:top resets #docs-main's own scrollTop on
  // every swap -- since the swap is innerHTML (the target node persists,
  // never a fresh element), scroll position would otherwise carry over
  // from whatever page the user was previously scrolled to.
  function htmxSwapSpec() {
    return 'innerHTML scroll:top ' + (reduceMotion ? 'swap:0ms settle:0ms' : 'swap:500ms settle:' + HTMX_SETTLE_MS + 'ms');
  }

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
    // Use the RESOLVED absolute URL (link.href), not the relative attribute:
    // the SPA router changes location via pushState, so a relative href would
    // re-resolve against the current page's depth and break the swap after a
    // cross-depth navigation (theme "dead until reload"). Absolute is depth-stable.
    var href = link.href;
    var base = href.replace(/agency-theme[^/]*\.css.*$/, '');
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
    // The index is the only page at the docs root; every component page lives
    // one level down. Cloudflare serves index.html at the trailing-slash URL.
    return /(?:^|\/)index\.html$/.test(path) || /\/$/.test(path) ? './' : '../';
  }

  function getHref(item, root) {
    if (item.file === null) return root;
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
            '<a href="' + root + '" class="docs-brand-link">' +
              '<div class="wui-hdr-icon"><span class="material-symbols-outlined" aria-hidden="true">eoc</span></div>' +
              '<div>' +
                '<div class="wui-hdr-title">weoc-ui</div>' +
                '<div class="wui-hdr-subtitle">Component Library Reference</div>' +
              '</div>' +
            '</a>' +
          '</div>' +
          '<div class="wui-hdr-right">' +
            '<div class="docs-search">' +
              '<span class="material-symbols-outlined docs-search-icon">search</span>' +
              '<input id="docs-search" type="text" class="docs-search-input" placeholder="Search components…" data-wui-i18n-attr="placeholder:docs_search_ph" autocomplete="off" spellcheck="false">' +
              '<span class="docs-search-kbd">Ctrl K</span>' +
              '<div id="docs-search-results" class="docs-search-results"></div>' +
            '</div>' +
            '<span class="docs-version wui-badge bordered secondary">v1.0</span>' +
            swatchHtml +
            '<button class="wui-btn ghost secondary wui-btn-sm" data-wui-theme-toggle title="Toggle theme">' +
              '<span class="material-symbols-outlined">dark_mode</span>' +
            '</button>' +
            '<button class="wui-btn ghost secondary wui-btn-sm" data-wui-lang-toggle title="Toggle language">' +
              '<span class="material-symbols-outlined">translate</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function groupKey(g) { return 'docs_group_' + g.toLowerCase().replace(/[^a-z0-9]+/g, '_'); }

  function renderSidebar(activeKey, root) {
    var html = '<nav class="docs-nav">';
    for (var i = 0; i < NAV.length; i++) {
      var group = NAV[i];
      html += '<div class="docs-nav-group">';
      html += '<div class="docs-nav-group-label" data-wui-i18n="' + groupKey(group.group) + '">' + group.group + '</div>';
      for (var j = 0; j < group.items.length; j++) {
        var item = group.items[j];
        var isActive = item.key === activeKey;
        var href = getHref(item, root);
        html += '<a href="' + href + '" class="docs-nav-item' + (isActive ? ' is-active' : '') + '" data-wui-i18n="docs_nav_' + item.key + '">' + item.label + '</a>';
      }
      html += '</div>';
    }
    html += '</nav>';
    return html;
  }

  /* Render the persistent chrome (header + sidebar) for a namespace.
     Called on first load AND after every htmx-boosted / popstate navigation —
     re-rendering the sidebar with the CURRENT root keeps relative links
     correct across the root/docs directory boundary, and refreshes the
     active item + title. */
  function renderChrome(ns, root) {
    var hdr = document.getElementById('docs-hdr');
    if (hdr) hdr.innerHTML = renderHeader(root);
    var sb = document.getElementById('docs-sidebar');
    if (sb) sb.innerHTML = renderSidebar(ns, root);
    if (window.htmx) {
      if (hdr) window.htmx.process(hdr);
      if (sb) window.htmx.process(sb);
    }
    var label = labelFor(ns);
    document.title = (label && ns !== 'home') ? 'weoc-ui — ' + label : 'weoc-ui — Component Library';
    if (window.Alpine && window._docsStoreReady) {
      window.Alpine.store('docs').activePage = ns;
    }
    // Localize freshly-rendered chrome + swapped page content (runs on first
    // load AND after every SPA navigation, so a new page shows in the active
    // language without needing a toggle).
    if (window.WUI && window.WUI.i18n) window.WUI.i18n.apply(document);
  }

  /* ── On-demand global assets ──────────────────────────────────────────────
     htmx's hx-select only pulls #docs-main's children out of the response —
     <head> is never touched by a swap — so anything a page needs must be present
     site-wide. Inject the add-on CSS (tables/maps/forms) + the shared JS
     libraries once. Guarded so direct loads that already link them don't
     double-load. */
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  /* Load the EN/AR translation store once (site-wide), then re-localize.
     docs-i18n.js calls WUI.i18n.register([...]) at parse. Loaded via `root`
     so it resolves at any page depth. */
  var i18nStoreLoaded = false;
  // Per-page translation files (chrome + several pages live in docs-i18n.js;
  // the rest are one file each under i18n/ to keep them maintainable).
  var I18N_PAGES = ['cards', 'calendar', 'tokens', 'motion', 'charts', 'containers',
    'feedback', 'loader', 'js-api', 'grid', 'flex', 'container', 'forms', 'layout', 'home', 'conventions', 'kpi-recipes',
    'kanban', 'heatmap', 'navigation', 'tabs', 'icons', 'avatars'];
  function ensureI18nStore(root) {
    if (i18nStoreLoaded) return Promise.resolve();
    i18nStoreLoaded = true;
    var chain = loadScript(root + 'docs-i18n.js');
    I18N_PAGES.forEach(function (p) {
      chain = chain.then(function () { return loadScript(root + 'i18n/' + p + '.js'); });
    });
    return chain.then(function () {
      if (window.WUI && window.WUI.i18n) window.WUI.i18n.apply(document);
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
    // site-wide because an htmx-boosted swap never re-processes incoming
    // <head> link tags (hx-select only pulls #docs-main's children out of
    // the response).
    ['tom-select.min.css', 'tom-select-agency.css',
     'flatpickr.min.css', 'flatpickr-agency.css',
     'tinymce-theme.css', 'sweetalert2.min.css'].forEach(function (f) {
      ensureCSS(shared + 'CSS/' + f);
    });
    // Prism syntax-highlight theme (token-driven, follows light/dark). Docs-only.
    ensureCSS(root + 'prism-agency.css');
    var jobs = [];
    // Prism.js — self-hosted, MANUAL mode (we drive highlighting after each
    // demo/page render, never on DOMContentLoaded). Set the flag BEFORE the
    // script loads so Prism honours it. Default bundle = markup + css + js.
    if (!window.Prism) {
      window.Prism = { manual: true };
      jobs.push(loadScript(root + 'vendor/prism/prism.min.js'));
    }
    // TinyMCE — fully self-hosted in vendor/tinymce-8.6.0/ (engine + skins/
    // themes/models/icons/plugins all resolve from that folder at runtime).
    // content_css / iframe theming is applied by tinymce.html's own
    // Alpine.data('tinymcePage', ...) component.
    if (!window.tinymce)     jobs.push(loadScript(root + 'vendor/tinymce-8.6.0/tinymce.min.js'));
    if (!window.gsap)        jobs.push(loadScript(shared + 'JS/gsap.min.js'));
    /* Navigation is handled by htmx (hx-boost on #docs-split/#docs-hdr, set in
       DocShell.init) plus the popstate listener in bindHtmxNav() below. */
    if (!window.WUICalendar) jobs.push(loadScript(shared + 'JS/weoc-calendar.js'));
    if (!window.TomSelect)   jobs.push(loadScript(shared + 'JS/tom-select.complete.min.js'));
    if (!window.flatpickr)   jobs.push(loadScript(shared + 'JS/flatpickr.min.js'));
    if (!window.uPlot)       jobs.push(loadScript(shared + 'JS/uPlot.iife.min.js'));
    if (!window.EOCLists)    jobs.push(loadScript(shared + 'JS/eoc-lists.js'));
    if (!window.Swal)        jobs.push(loadScript(shared + 'JS/sweetalert2.all.min.js'));
    if (!window.Alpine) {
      // The vendored CDN build (docs/vendor/alpine/cdn.js, confirmed by direct
      // source read) ends with `window.Alpine = src_default; queueMicrotask(()
      // => src_default.start());` — it NEVER reads window.deferLoadingAlpine
      // (grep confirms zero references in this build), so that hook is a
      // no-op here and must not be relied on. Because loadScript()'s promise
      // resolves via script.onload, which only fires AFTER the script's own
      // top-level code (and thus its queueMicrotask call) has already run,
      // Alpine's auto-start microtask is queued strictly BEFORE the
      // Promise.all(jobs).then() callback below even gets queued — by FIFO
      // microtask order, Alpine has already started and walked the DOM once
      // by the time that .then() runs. We therefore do NOT call
      // window.Alpine.start() ourselves below; doing so would be a redundant
      // second start() on top of Alpine's own auto-start, which is exactly
      // what caused every page's x-init to fire twice (and made
      // lists.html's `new TomSelect(...)` throw "already initialized" on
      // most cold loads). The docs.store setup below still runs from this
      // same .then() — after Alpine's first walk, but nothing in this site's
      // HTML reads $store('docs') synchronously from x-init/x-data (verified
      // via `grep -rn "\$store" docs/`: the only reads are from this file
      // itself, in renderChrome() and DocShell.store()), so a slightly later
      // store registration is safe.
      jobs.push(loadScript(root + 'vendor/alpine/cdn.min.js'));
    }
    if (!window.htmx)        jobs.push(loadScript(root + 'vendor/htmx/htmx.min.js'));
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
          // runPageInit() writes into page.* for x-data blocks on that page.
          // Alpine destroys element-bound scopes automatically when the htmx
          // swap replaces #docs-main's children with the incoming page's —
          // no manual cleanup needed. (#docs-main itself never carries
          // x-data, verified across all pages, so nothing survives the swap
          // that shouldn't.)
          page: {}
        });
        // NOTE: no window.Alpine.start() call here — Alpine's own vendored
        // bundle already auto-started itself via queueMicrotask (see the
        // long comment above, at the `!window.Alpine` branch). Calling
        // start() a second time here was the actual bug (double x-init
        // firing); this store registration alone is sufficient, since
        // nothing in the site's markup reads $store('docs') synchronously
        // during Alpine's first DOM walk.
      }
      var jobs2 = [];
      if (!window.TomSelectFactory) jobs2.push(loadScript(shared + 'JS/tom-select-factory.js'));
      if (!window.FlatpickrFactory)  jobs2.push(loadScript(shared + 'JS/flatpickr-factory.js'));
      if (!window.WUIAnim)           jobs2.push(loadScript(shared + 'JS/weoc-anim.js'));
      if (!window.WUI || !window.WUI.chart) jobs2.push(loadScript(shared + 'JS/wui-charts.js'));
      if (!window.WUI || !window.WUI.heatmap) jobs2.push(loadScript(shared + 'JS/wui-heatmap.js'));
      if (!window.WUI || !window.WUI.kanban) jobs2.push(loadScript(shared + 'JS/wui-kanban.js'));
      if (!window.WUI || !window.WUI.alert) jobs2.push(loadScript(shared + 'JS/wui-alert.js'));
      return Promise.all(jobs2);
    });
  }

  /* ── wui-demo: single-source live example + code ──────────────────────────
     The .wui-demo-preview holds the LIVE markup (the source of truth). We read
     its innerHTML and render it as the Markup code box, so the code shown is
     exactly what produced the preview — they cannot drift. LAYOUT demos may
     instead supply <template class="wui-demo-markup"> to OVERRIDE that Markup box
     with an authored version (real component + placeholder comments) when the
     literal scaffolding is noise; the live preview still renders as-is. An optional
     <template class="wui-demo-css"> becomes a CSS box (for override snippets) and
     an optional <template class="wui-demo-js"> becomes a JavaScript box;
     data-wui-demo-run also executes the JS, so JS demos are single-source too.
     2+ boxes render as tabs (Markup / CSS / JavaScript). Idempotent. */
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dedent(s) {
    var lines = s.replace(/\t/g, '  ').replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
    var min = Infinity;
    for (var i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var lead = lines[i].match(/^ */)[0].length;
      if (lead < min) min = lead;
    }
    if (!isFinite(min)) min = 0;
    for (var j = 0; j < lines.length; j++) lines[j] = lines[j].slice(min);
    return lines.join('\n');
  }
  /* Prism highlight, idempotent + safe if Prism isn't loaded. Operates on the
     element in place (works on <code class="language-*"> or a bare tagged <pre>).
     Copy still returns exact source — textContent is unchanged by tokenising. */
  function highlightEl(el) {
    if (!el || el.getAttribute('data-prism-done') === '1') return;
    if (window.Prism && window.Prism.highlightElement) {
      el.setAttribute('data-prism-done', '1');
      try { window.Prism.highlightElement(el); } catch (e) {}
    }
  }
  /* Build the <pre class="docs-code"><code class="language-*"> shell for a snippet. */
  function codePre(codeText, lang, extraCls) {
    var pre = document.createElement('pre');
    pre.className = 'docs-code' + (extraCls ? ' ' + extraCls : '');
    var code = document.createElement('code');
    code.className = 'language-' + (lang || 'markup');
    code.textContent = codeText;           // textContent = safe, exact
    pre.appendChild(code);
    highlightEl(code);
    return pre;
  }
  function codeBox(label, icon, codeText, lang) {
    var wrap = document.createElement('div');
    var bar = document.createElement('div');
    bar.className = 'wui-demo-codebar';
    bar.innerHTML =
      '<span class="wui-demo-codelabel"><span class="material-symbols-outlined">' +
        icon + '</span>' + label + '</span>' +
      '<button class="wui-demo-copy" type="button" data-demo-copy>' +
        '<span class="material-symbols-outlined">content_copy</span>Copy</button>';
    wrap.appendChild(bar);
    wrap.appendChild(codePre(codeText, lang));
    return wrap;
  }
  /* Two+ code boxes (Markup + JavaScript) rendered as tabs, so the demo doesn't
     become a long scroll. One shared copy button copies the active pane. */
  function tabbedCode(boxes) {
    var wrap = document.createElement('div');
    wrap.className = 'wui-demo-tabbed';
    var tabs = '';
    for (var i = 0; i < boxes.length; i++) {
      tabs += '<button type="button" class="wui-demo-tab' + (i === 0 ? ' is-active' : '') +
        '" data-demo-tab="' + i + '"><span class="material-symbols-outlined">' +
        boxes[i].icon + '</span>' + boxes[i].label + '</button>';
    }
    var bar = document.createElement('div');
    bar.className = 'wui-demo-tabbar';
    bar.innerHTML = '<div class="wui-demo-tablist">' + tabs + '</div>' +
      '<button class="wui-demo-copy" type="button" data-demo-copy>' +
      '<span class="material-symbols-outlined">content_copy</span>Copy</button>';
    wrap.appendChild(bar);
    for (var j = 0; j < boxes.length; j++) {
      var pre = codePre(boxes[j].code, boxes[j].lang, 'wui-demo-pane' + (j === 0 ? ' is-active' : ''));
      pre.setAttribute('data-demo-pane', j);
      wrap.appendChild(pre);
    }
    return wrap;
  }

  function renderDemos(root) {
    var scope = root || document;
    var demos = scope.querySelectorAll('[data-wui-demo]');
    for (var i = 0; i < demos.length; i++) {
      var demo = demos[i];
      if (demo.getAttribute('data-demo-ready') === '1') continue;
      demo.setAttribute('data-demo-ready', '1');

      var preview = demo.querySelector('.wui-demo-preview');
      var markupTpl = demo.querySelector('template.wui-demo-markup');
      var cssTpl = demo.querySelector('template.wui-demo-css');
      var jsTpl = demo.querySelector('template.wui-demo-js');
      var boxes = [];
      // Markup box source: an explicit <template class="wui-demo-markup"> OVERRIDES
      // the live preview (used for LAYOUT demos where serialising the visible
      // scaffolding — filler boxes etc. — is noise; the override shows the real
      // component with authored placeholder comments). Everywhere else, code ==
      // the exact live preview (single-source invariant preserved).
      if (markupTpl) {
        var mText = dedent(markupTpl.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        boxes.push({ label: 'Markup', icon: 'code', lang: 'markup', code: mText });
      } else if (preview) {
        boxes.push({ label: 'Markup', icon: 'code', lang: 'markup', code: dedent(preview.innerHTML) });
      }
      if (cssTpl) {
        var cssText = dedent(cssTpl.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        boxes.push({ label: 'CSS', icon: 'css', lang: 'css', code: cssText });
      }
      if (jsTpl) {
        var jsText = dedent(jsTpl.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        boxes.push({ label: 'JavaScript', icon: 'javascript', lang: 'javascript', code: jsText });
      }
      var group = document.createElement('div');
      group.className = 'wui-demo-code-group';
      // 1 box (markup-only) = plain labeled box; 2+ (markup + JS) = tabbed, to
      // avoid a long stacked scroll (user request).
      if (boxes.length === 1) group.appendChild(codeBox(boxes[0].label, boxes[0].icon, boxes[0].code, boxes[0].lang));
      else if (boxes.length > 1) group.appendChild(tabbedCode(boxes));
      demo.appendChild(group);

      // Optionally EXECUTE the JS so the shown snippet is the running snippet.
      if (jsTpl && demo.hasAttribute('data-wui-demo-run')) {
        try { (new Function(jsTpl.content ? tplText(jsTpl) : jsTpl.textContent))(); }
        catch (e) { /* demo JS error — leave preview as-is */ }
      }
    }
  }
  function tplText(tpl) {
    // template content is inert; serialise it back to text for execution
    var d = document.createElement('div');
    d.appendChild(tpl.content.cloneNode(true));
    return d.textContent;
  }

  /* Copy buttons for demo code boxes — delegated, bound once. */
  var demoCopyBound = false;
  function bindDemoCopy() {
    if (demoCopyBound) return;
    demoCopyBound = true;
    document.addEventListener('click', function (e) {
      // Tab switch (Markup / JavaScript)
      var tab = e.target.closest('[data-demo-tab]');
      if (tab) {
        var wrap = tab.closest('.wui-demo-tabbed');
        if (wrap) {
          var idx = tab.getAttribute('data-demo-tab');
          wrap.querySelectorAll('[data-demo-tab]').forEach(function (t) { t.classList.toggle('is-active', t === tab); });
          wrap.querySelectorAll('[data-demo-pane]').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-demo-pane') === idx); });
        }
        return;
      }
      var btn = e.target.closest('[data-demo-copy]');
      if (!btn) return;
      var pre, tabbed = btn.closest('.wui-demo-tabbed');
      if (tabbed) pre = tabbed.querySelector('.wui-demo-pane.is-active');
      else { var bar = btn.closest('.wui-demo-codebar'); pre = bar && bar.nextElementSibling; }
      if (!pre) return;
      var done = function () {
        btn.classList.add('is-copied');
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>Copied';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>Copy';
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(done, function () {});
      }
    });
  }

  /* Highlight hand-authored code blocks (js-api / lists integration samples)
     tagged <pre class="docs-code language-*">. Demo-generated boxes are already
     highlighted as they're built (codePre); highlightEl's guard skips them. */
  function highlightStatic(root) {
    var scope = root || document;
    var els = scope.querySelectorAll('pre.docs-code[class*="language-"], .docs-code code[class*="language-"]');
    for (var i = 0; i < els.length; i++) highlightEl(els[i]);
  }

  function runPageInit() {
    renderDemos(document);
    bindDemoCopy();
    highlightStatic(document);
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

  /* First-load entrance — stagger the hero + sections. One-shot; subsequent
     htmx-boosted navigations use the GSAP curtain wipe instead (coverIn/
     revealOut below). gsap.from so nothing gets stuck hidden if gsap
     somehow fails. */
  function entranceAnimate() {
    if (reduceMotion || !window.gsap) return;
    window.gsap.from('.docs-hero, .docs-section', {
      y: 14, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05
    });
  }

  /* ── GSAP curtain wipe — DOC-SITE ONLY ────────────────────────────────────
     Static sidebar + header (outside #docs-main); only #docs-main swaps.
     The wipe is driven off htmx's own swap lifecycle hooks (coverIn from
     htmx:beforeSwap, revealOut from applySwappedPage after afterSwap/
     popstate) — see the "htmx swap lifecycle" section below. NOTE: this is
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

  function coverIn(target) {
    if (reduceMotion || !window.gsap) return Promise.resolve();
    var el = wipeEl();
    placeWipe(el, target);
    window.gsap.set(el, { transformOrigin: 'left center', scaleX: 0 });
    return window.gsap.to(el, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' });
  }
  function revealOut(target) {
    if (reduceMotion || !window.gsap) return Promise.resolve();
    var el = wipeEl();
    placeWipe(el, target);
    window.gsap.set(el, { transformOrigin: 'right center', scaleX: 1 });
    return window.gsap.to(el, { scaleX: 0, duration: 0.55, ease: 'power3.inOut', delay: 0.08 });
  }

  /* ── htmx swap lifecycle ──────────────────────────────────────────────────
     htmx owns navigation (hx-boost on #docs-split and #docs-hdr, set in
     DocShell.init).
     We hang chrome re-render + runPageInit + the GSAP curtain off htmx's own
     documented swap/settle delay window instead of overriding htmx's
     internal swap/history handling (that interaction is undocumented and
     was deliberately avoided — see plan Task 2 header note). */
  /* The URL-argument twin of getRoot(): works out the link root for the page
     being swapped IN (which is not location.pathname yet at afterSwap time).
     MUST stay in sync with getRoot() — it tests for the same two forms of the
     home page, docs/index.html and the trailing-slash URL Cloudflare serves it
     at. It previously tested for `weoc-ui-docs.html`, a filename that no
     longer exists (the home page was renamed to index.html), so it ALWAYS
     returned '../'. Every SPA navigation to the home page therefore
     re-rendered the chrome one level too deep, turning every sidebar href into
     ../docs/<page>.html — a 404 from /docs/ — until a manual reload. */
  function rootForPath(path) {
    var clean = String(path || '').replace(/\\/g, '/').split('#')[0].split('?')[0];
    return /(?:^|\/)index\.html$/.test(clean) || /\/$/.test(clean) ? './' : '../';
  }
  /* Home-page pathname equivalence for the lastKnownPathname same-page check
     below. /docs/ and /docs/index.html are the SAME page as far as
     rootForPath()/getRoot() are concerned (both resolve to './') -- but a
     literal location.pathname === lastKnownPathname comparison doesn't know
     that, so entering via one form and later popping to/from the other form
     was treated as a cross-page navigation (the heavier fetch+swap path)
     when it should have been the same-page hash-only short-circuit. Strips
     a trailing 'index.html' down to the directory it lives in so both forms
     compare equal; every non-home path is returned unchanged. */
  function canonicalPath(path) {
    var clean = String(path || '').replace(/\\/g, '/');
    return clean.replace(/(?:^|\/)index\.html$/, function (m) { return m.charAt(0) === '/' ? '/' : ''; });
  }
  function nsForUrl(url) {
    var clean = (url || '').split('#')[0].split('?')[0];
    var file = clean.split('/').pop();
    // Same stale-rename note as rootForPath above. Unlike rootForPath this one
    // was never user-visible: 'index.html' is not any NAV item's `file` (the
    // home item carries file: null), so the home page still fell through to
    // the 'home' return at the bottom.
    if (/(?:^|\/)index\.html$/.test(clean) || file === '') return 'home';
    for (var i = 0; i < NAV.length; i++)
      for (var j = 0; j < NAV[i].items.length; j++)
        if (NAV[i].items[j].file && NAV[i].items[j].file === file) return NAV[i].items[j].key;
    return 'home';
  }

  /* ── Navigation race guard ────────────────────────────────────────────────
     htmx's own boost fetch (beforeRequest/beforeSwap/afterSwap) and the
     hand-rolled popstate fetch below are two independent async engines that
     both write to #docs-main/chrome, with no coordination between them.
     Rapid repeated Back presses, or a Back press immediately followed by a
     different sidebar click, can let an earlier-triggered fetch resolve
     AFTER a later one and clobber the DOM with stale content. latestNav is
     a monotonic token: each engine bumps it and captures its own value at
     the moment its navigation STARTS (request dispatch / popstate fired),
     then refuses to apply its result if a newer navigation has since
     started. Bumping at start time (not at response-arrival time) is what
     makes the ordering correspond to when each navigation was actually
     triggered — see the htmx:beforeRequest listener below for why this
     matters. */
  var latestNav = 0;

  /* Tracks the pathname of whatever page is actually loaded in #docs-main
     right now — updated only when a REAL cross-page swap completes (see
     applySwappedPage below), never on a same-page hash-only pushState (the
     search-hit capture-phase click handler and the popstate handler's own
     short-circuit both change only location.hash, not location.pathname).
     Read by the popstate listener to tell "Back/Forward past a same-page
     hash change" apart from "Back/Forward to an actually different page" —
     see the comment there for why that distinction matters. Initialized at
     script-parse time to whatever page is loaded right now; docs-shell.js
     is loaded once and persists across every SPA navigation afterward (same
     assumption bindSearch()'s getRoot()-per-call comment already relies
     on), so this stays correct without a DOMContentLoaded/init hook. */
  var lastKnownPathname = location.pathname;

  /* Apply an already-fetched page's content: renderChrome (which ends with
     its own WUI.i18n.apply) + runPageInit + the GSAP reveal. Shared by both
     the htmx:afterSwap listener
     (which already has the swapped-in DOM from evt.detail) and the popstate
     listener (which does its own separate fetch) — only the fetching differs
     between the two call sites, everything after "we know ns/root and the
     new content is already in #docs-main" lives here once. This is also the
     one shared point after which a cross-page swap has actually completed,
     so it's where lastKnownPathname gets updated for the popstate
     same-page-hash-only check above. */
  function applySwappedPage(ns, root) {
    lastKnownPathname = location.pathname;
    renderChrome(ns, root); // already ends with its own WUI.i18n.apply(document)
    runPageInit();
    revealOut(document.getElementById('docs-main'));
    scrollToHashTarget();
  }

  /* Deep-search hits (and any future in-page anchor link) carry a
     #sectionId. On a normal page-to-page nav this scroll already happened
     for free via the browser's native hash-jump on load -- but SPA swaps
     never trigger that (the URL's hash was already set by pushState before
     the new content existed), so it has to be done explicitly here, once
     the swapped content is actually in the DOM.

     immediate=true (used by the same-page branch of the search click
     handler below, which never goes through htmx at all -- no swap
     happens) scrolls synchronously.

     immediate=false/omitted (used by applySwappedPage, i.e. every
     cross-page hit) DEFERS the scroll. This is required, not just
     defensive: htmxSwapSpec() puts "scroll:top" on every boosted swap, and
     htmx applies that reset during ITS OWN settle phase, which -- traced
     in docs/vendor/htmx/htmx.min.js -- runs via
     setTimeout(settleFn, settleDelay) scheduled right after htmx:afterSwap
     fires (htmx:afterSwap itself fires synchronously, which is where
     applySwappedPage/this function runs). Confirmed live: scrolling
     synchronously in afterSwap gets silently stomped back to scrollTop=0
     ~630ms later when htmx's own settle callback runs. Deferring past that
     window (settleDelay + buffer) lets our scroll win instead. The
     popstate call site has no htmx settle phase to race -- the same defer
     is just a harmless extra wait there, not a correctness requirement.

     The latestNav re-check inside the deferred branch guards a gap this
     defer newly opens: applySwappedPage's callers already confirm
     myNav === latestNav before calling it, but that guarantee is only
     good for the synchronous instant it's checked. Across a ~680ms
     deferred window a second navigation (e.g. another search-result click)
     can start and finish before this timer fires; without the re-check,
     this timer would blindly scroll/flash a target that may belong to
     content the newer navigation already replaced. */
  function scrollToHashTarget(immediate) {
    var hash = location.hash ? location.hash.slice(1) : '';
    if (!hash) return;
    var run = function () {
      var target = document.getElementById(hash);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('docs-search-target-flash');
      setTimeout(function () { target.classList.remove('docs-search-target-flash'); }, 1300);
    };
    if (immediate) {
      // Bump latestNav even though this synchronous path never reads the
      // token back itself: an EARLIER cross-page nav may still have a
      // deferred scroll pending in the setTimeout below (it waits out the
      // full htmx settle window). Without this bump, that stale timer's
      // myNav === latestNav check would still pass once it fires, and it
      // would yank the page back to ITS target after this same-page click
      // already scrolled to the one the user actually just clicked --
      // reusing the same monotonic-token guard the cross-page-vs-cross-page
      // race already relies on, rather than a second parallel mechanism.
      latestNav++;
      run();
      return;
    }
    var myNav = latestNav;
    setTimeout(function () {
      if (myNav !== latestNav) return; // a newer navigation started during the defer window; drop this stale scroll
      run();
    }, (reduceMotion ? 0 : HTMX_SETTLE_MS) + 50);
  }

  var htmxNavBound = false;
  function bindHtmxNav() {
    if (htmxNavBound) return;
    htmxNavBound = true;

    document.body.addEventListener('htmx:beforeRequest', function (evt) {
      if (!evt.detail || !evt.detail.target || evt.detail.target.id !== 'docs-main') return;
      // Bump + tag the token HERE, at request-dispatch time (htmx:beforeRequest
      // fires right before the XHR is sent — evt.detail.xhr already exists,
      // confirmed against docs/vendor/htmx/htmx.min.js: the same `T` object
      // that carries `xhr` is what beforeRequest's evt.detail is), not in
      // htmx:beforeSwap. beforeSwap only fires AFTER the response has already
      // arrived, right before the DOM swap — bumping there timestamps the
      // token to response-ARRIVAL order, not click order. That let a slow
      // boosted click's token look newer than an intervening Back navigation
      // that was actually triggered after the click: the click's late
      // response would bump latestNav again when it finally arrived and win
      // the race, silently overwriting the already-applied, actually-newer
      // popstate content. Stashing on the xhr object (not a plain outer var)
      // is still required for the same reason as before: htmx's own
      // swap+settle delay (500ms + 630ms, see hx-swap above) leaves a real
      // async gap during which another navigation can bump latestNav again
      // before this transaction's beforeSwap/afterSwap read their token back.
      var myNav = ++latestNav;
      if (evt.detail.xhr) evt.detail.xhr.__navToken = myNav;
    });

    document.body.addEventListener('htmx:beforeSwap', function (evt) {
      if (!evt.detail || !evt.detail.target || evt.detail.target.id !== 'docs-main') return;
      // Staleness MUST be checked here, not in htmx:afterSwap: by the time
      // afterSwap fires, htmx has already unconditionally written the
      // response into #docs-main's innerHTML — a check there is too late to
      // stop the bad write, it can only skip our own chrome/PAGE_INIT re-run
      // afterward, leaving #docs-main's visible content stale while the
      // sidebar/title/URL correctly show the newer page. beforeSwap is
      // htmx's own documented cancellation point: setting
      // evt.detail.shouldSwap = false stops htmx performing the swap at all
      // (confirmed by tracing docs/vendor/htmx/htmx.min.js: the swap-and-
      // history-update call, which also fires htmx:afterSwap internally,
      // lives entirely inside `if (m.shouldSwap) { ... }` in the response
      // handler — setting it false skips the DOM write, the history push,
      // AND afterSwap for this transaction).
      var myNav = (evt.detail.xhr && evt.detail.xhr.__navToken) || 0;
      if (myNav !== latestNav) {
        // A newer navigation has started since this request began. Cancel
        // htmx's swap outright and bail before covering — there is nothing
        // to animate a curtain over since this content will never be
        // written to the DOM. (Covering here unconditionally, even for a
        // transaction later found to be stale, was the cause of the GSAP
        // curtain getting stuck: revealOut() only runs from
        // applySwappedPage(), which the stale branch never reaches.)
        evt.detail.shouldSwap = false;
        return;
      }
      coverIn(document.getElementById('docs-main'));
    });

    document.body.addEventListener('htmx:afterSwap', function (evt) {
      if (!evt.detail || !evt.detail.target || evt.detail.target.id !== 'docs-main') return;
      // Defensive backstop only: htmx:beforeSwap above already cancels the
      // swap (shouldSwap = false) for a stale transaction, and tracing
      // htmx.min.js confirmed afterSwap never even fires in that case (it's
      // dispatched from inside the same `if (m.shouldSwap)` block as the
      // swap itself). This check is therefore dead code for the stale-token
      // case today; kept as a harmless second guard in case htmx's internals
      // ever change, or in case shouldSwap gets reset by some other
      // htmx:beforeSwap listener between here and there.
      var myNav = (evt.detail.xhr && evt.detail.xhr.__navToken) || 0;
      var url = (evt.detail.xhr && evt.detail.xhr.responseURL) || location.href;
      var ns = nsForUrl(url);
      var root = rootForPath(url);
      if (myNav !== latestNav) return; // a newer nav started; drop this stale one
      applySwappedPage(ns, root);
    });

    // Live-verification finding (see plan Task 2 Step 5): htmx vendors its own
    // window.onpopstate wiring inside a top-level "ready" block that only
    // fires correctly when htmx.min.js is a STATIC <script> parsed by the
    // HTML parser. Loaded the way every other library here is loaded — via
    // loadScript() appending a <script> element after the page has already
    // settled — that block silently never runs (confirmed empirically: 0
    // console errors, htmx:load never fires, window.onpopstate stays null),
    // so htmx's own history-cache restore never engages and the Back/Forward
    // buttons would otherwise change the URL while leaving stale content on
    // screen. This handler does NOT touch history.pushState/replaceState —
    // the browser has already moved the URL natively by the time 'popstate'
    // fires — it only re-fetches and re-renders #docs-main to match, so it
    // can't fight or duplicate htmx's own (boost-driven, forward-navigation)
    // history entries.
    //
    // coverIn() is fired-and-forgotten rather than awaited (same as the
    // htmx:beforeSwap handler above) and raced against a fixed timeout: a
    // GSAP tween's returned thenable only resolves on its next rAF-driven
    // tick, which browsers pause for a backgrounded/hidden document, so
    // awaiting it unconditionally could hang this handler forever.
    window.addEventListener('popstate', function () {
      var main = document.getElementById('docs-main');
      if (!main) return;
      // Whole-branch review Finding 6: a same-page search hit only ever
      // does history.pushState(null, '', href) to change the hash (see the
      // capture-phase click handler in bindSearch() below — it never
      // touches pathname). Without this check, pressing Back afterward hit
      // this listener's full fetch+innerHTML-swap+applySwappedPage path
      // (GSAP curtain, runPageInit(), chart/TinyMCE/map re-init) for what
      // should be nothing more than a scroll-position change back to
      // wherever the hash previously pointed — a heavy, visibly janky
      // operation for a same-page hash change, and one #docs-main's content
      // never actually needed. location.pathname has already been updated
      // natively by the browser by the time 'popstate' fires (see the note
      // below), so comparing it to lastKnownPathname (updated only on a
      // REAL cross-page swap, in applySwappedPage) cleanly tells the two
      // cases apart.
      if (canonicalPath(location.pathname) === canonicalPath(lastKnownPathname)) {
        // Bump latestNav here too, even though this branch never fetches
        // anything. scrollToHashTarget(true) only bumps the token AFTER its
        // own `if (!hash) return` guard (see that function) -- so popping to
        // a HASH-LESS entry on the same pathname would otherwise bump
        // nothing, leaving a stale in-flight cross-page navigation's token
        // still valid and able to incorrectly win a race against this more
        // recent Back/Forward action. Every other real navigation event in
        // this file already bumps latestNav unconditionally at its own
        // start (see the htmx:beforeRequest listener and this same block's
        // fetch path below); this keeps that invariant intact here too.
        latestNav++;
        scrollToHashTarget(true);
        return;
      }
      // Bump + capture immediately (re-entrancy guard, see comment block
      // above): rapid repeat Back presses, or a Back press immediately
      // followed by a different sidebar click, must not let this fetch's
      // eventual resolution overwrite whatever navigation started later.
      var myNav = ++latestNav;
      var url = location.href;
      coverIn(main);
      var curtainSettled = new Promise(function (resolve) { setTimeout(resolve, 500); });
      curtainSettled
        .then(function () { return fetch(url, { credentials: 'same-origin' }); })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          if (myNav !== latestNav) return; // a newer navigation has since started; drop this stale one
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var incoming = doc.getElementById('docs-main');
          main.innerHTML = incoming ? incoming.innerHTML : html;
          // This handler doesn't go through htmx's swap machinery (it's a
          // manual fetch+innerHTML for popstate), so it doesn't get
          // htmxSwapSpec()'s scroll:top modifier for free -- reset explicitly.
          main.scrollTop = 0;
          var ns = nsForUrl(url);
          var root = rootForPath(url);
          applySwappedPage(ns, root);
        })
        .catch(function () { location.reload(); });
    });
  }

  /* ── Search (section-level, bilingual, MiniSearch-backed) ──────────────────
     Index is lazy-loaded on first focus of #docs-search (not on page load,
     to avoid blocking initial render) and cached for the session -- rebuilt
     from scratch on a fresh hard load, reused across every SPA navigation
     since docs-shell.js itself never reloads. */
  var searchBound = false;
  var searchIndexPromise = null;

  function loadSearchIndex(root) {
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = Promise.all([
      fetch(root + 'search-index.json').then(function (r) {
        if (!r.ok) throw new Error('search-index.json ' + r.status);
        return r.json();
      }),
      loadScript(root + 'vendor/minisearch/minisearch.min.js').then(function () { return window.MiniSearch; })
    ]).then(function (results) {
      var docs = results[0], MiniSearch = results[1];
      var mini = new MiniSearch({
        idField: 'id',
        fields: ['textEn', 'textAr'],
        // titleEn/titleAr must be listed here too, not just textEn/textAr --
        // MiniSearch only returns fields named in storeFields on a hit;
        // omitting them (as this list originally did) means hit.titleEn/
        // hit.titleAr are always undefined at render time regardless of
        // what's actually in search-index.json, silently falling through to
        // renderSearchResults()' de-slugified-sectionId fallback for every
        // single result -- exactly the Finding 7 bug, caught live testing
        // this fix rather than by reading the diff alone.
        storeFields: ['kind', 'page', 'pageTitle', 'group', 'sectionId', 'titleEn', 'titleAr', 'textEn', 'textAr']
      });
      mini.addAll(docs);
      return mini;
    }).catch(function (err) {
      var input = document.getElementById('docs-search');
      if (input) {
        input.disabled = true;
        input.placeholder = 'Search unavailable';
        input.classList.add('docs-search-input-disabled');
      }
      searchIndexPromise = null; // allow a retry on the next focus (e.g. after a flaky network blip)
      throw err;
    });
    return searchIndexPromise;
  }

  // text here is the RAW section text (build-search-index.js's stripTags
  // already unescaped any HTML entities out of it before it was ever written
  // to search-index.json -- textEn/textAr on the wire are plain text, not
  // HTML), so this function owns both the term-matching AND the escaping,
  // and the ORDER between them matters:
  //
  // 1. Match terms against the raw text first (single alternation regex,
  //    one pass -- see below for why single-pass matters).
  // 2. Walk the match positions, escaping each matched/unmatched RUN
  //    independently as it's emitted.
  // 3. Only then wrap a matched run in <mark>/</mark>.
  //
  // Escaping the whole string up front and matching terms against the
  // ALREADY-ESCAPED text (the previous approach) fixed one bug but left
  // another: a term whose letters happen to appear inside text that escapes
  // to contain them -- e.g. term "amp" against raw text containing a literal
  // "&" (which escapes to "&amp;"), or term "lt" against raw text containing
  // a literal "<" (which escapes to "&lt;") -- would match INSIDE the
  // escaped entity and wrap it, corrupting it into visibly-broken text like
  // literal "&amp;amp;". Matching against the raw text first and escaping
  // each run afterward means a match can never land inside a
  // not-yet-created entity, because entities don't exist yet at match time.
  //
  // Single alternation regex + single pass over the raw text (NOT one
  // .replace() call per term chained sequentially) is still required on top
  // of the above, for a separate reason (whole-branch review Finding 2):
  // chaining ran each term's replace against the PREVIOUS term's own
  // <mark>-wrapped output, so a later term whose letters happen to match
  // inside "<mark>"/"</mark>" (an m/a/r/k) got wrapped too, corrupting the
  // tag itself. A single pass matching any term at each position of the
  // untouched original text cannot re-match output it already produced.
  function highlightSnippet(text, terms) {
    if (!text) return '';
    var truncated = text.length > 140 ? text.slice(0, 140) + '…' : text;
    var escapedTerms = terms.filter(function (t) { return t; })
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!escapedTerms.length) return escapeHtml(truncated);
    var re = new RegExp('(' + escapedTerms.join('|') + ')', 'ig');
    var out = '';
    var lastIndex = 0;
    var m;
    while ((m = re.exec(truncated))) {
      out += escapeHtml(truncated.slice(lastIndex, m.index));
      out += '<mark>' + escapeHtml(m[0]) + '</mark>';
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++; // defensive: no real term produces a zero-length match
    }
    out += escapeHtml(truncated.slice(lastIndex));
    return out;
  }

  function renderSearchResults(q, root) {
    var panel = document.getElementById('docs-search-results');
    if (!panel) return;
    q = (q || '').trim();
    if (!q) { panel.innerHTML = ''; panel.classList.remove('is-open'); return; }

    loadSearchIndex(root).then(function (mini) {
      var lang = (window.WUI && window.WUI.i18n) ? window.WUI.i18n.getLang() : 'en';
      var field = lang === 'ar' ? 'textAr' : 'textEn';
      var results = mini.search(q, { fields: [field], prefix: true, fuzzy: 0.2 }).slice(0, 20);

      if (!results.length) {
        panel.innerHTML = '<div class="docs-search-empty">No matches</div>';
        panel.classList.add('is-open');
        return;
      }

      var byPage = {};
      var order = [];
      results.forEach(function (r) {
        if (!byPage[r.page]) { byPage[r.page] = []; order.push(r.page); }
        byPage[r.page].push(r);
      });

      var titleField = lang === 'ar' ? 'titleAr' : 'titleEn';
      var terms = q.split(/\s+/);
      var swapSpec = htmxSwapSpec();
      var html = '';
      order.forEach(function (page) {
        var hits = byPage[page];
        // page === 'index.html' is the home page (the one NAV item with
        // file:null -- see getHref() above, and build-search-index.js's own
        // navByFile keying, which the indexer treats the exact same way).
        // Every OTHER page's href is root + 'docs/' + page; the home page's
        // href is root itself, with no 'docs/<file>' segment, since
        // docs/index.html IS the docs-site root.
        var isHome = page === 'index.html';
        html += '<div class="docs-search-group"><div class="docs-search-group-title">' + escapeHtml(hits[0].pageTitle) + '</div>';
        hits.forEach(function (hit) {
          var href = (isHome ? root : root + 'docs/' + hit.page) + (hit.kind === 'section' ? '#' + hit.sectionId : '');
          var snippet = hit.kind === 'section' ? highlightSnippet(hit[field] || hit.textEn, terms) : '';
          // Real section title (from the indexer's titleEn/titleAr, resolved
          // the same way textEn/textAr are), not the de-slugified sectionId
          // ("css js minimalism declarative first" instead of "CSS/JS
          // minimalism — declarative first") -- and language-aware, so AR
          // mode doesn't leak English slug text into results. Falls back to
          // the EN title, then the slug, only if a title was never captured.
          var label = hit.kind === 'section'
            ? (hit[titleField] || hit.titleEn || hit.sectionId.replace(/-/g, ' '))
            : hit.pageTitle;
          html += '<a class="docs-search-hit" href="' + href + '" data-search-hit' +
            ' hx-get="' + href + '" hx-push-url="true" hx-target="#docs-main"' +
            ' hx-select="#docs-main &gt; *" hx-swap="' + swapSpec + '">' +
            '<span class="docs-search-hit-label">' + escapeHtml(label) + '</span>' +
            (snippet ? '<span class="docs-search-hit-snippet">' + snippet + '</span>' : '') +
            '</a>';
        });
        html += '</div>';
      });
      panel.innerHTML = html;
      panel.classList.add('is-open');
      if (window.htmx) window.htmx.process(panel);
    }).catch(function () {
      // loadSearchIndex() already put the input into its disabled state and
      // logged nothing user-facing beyond that -- nothing further to do here
      // besides not leaving an unhandled rejection.
    });
  }

  function bindSearch() {
    if (searchBound) return;
    searchBound = true;
    // getRoot() is called fresh inside each handler below, NOT cached in a
    // closure var here -- bindSearch() itself only ever runs once per true
    // page load (guarded by searchBound above), but docs-shell.js persists
    // across every SPA navigation afterward, and index.html (depth 0) vs.
    // every docs/docs/*.html page (depth 1) need different root prefixes.
    // A closured root computed once at bind time goes stale the moment the
    // user SPA-navigates across that depth boundary -- confirmed live: it
    // silently produces an extra/missing 'docs/' segment in every search
    // hit's href thereafter (404s the first click after such a nav), even
    // though renderChrome() elsewhere already gets this right by taking a
    // freshly-computed root per navigation.
    document.addEventListener('focus', function (e) {
      if (e.target && e.target.id === 'docs-search') loadSearchIndex(getRoot()).catch(function () {});
    }, true);
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'docs-search') renderSearchResults(e.target.value, getRoot());
    });
    document.addEventListener('keydown', function (e) {
      var input = document.getElementById('docs-search');
      if (!input) return;
      if (e.key === 'Enter' && document.activeElement === input) {
        var first = document.querySelector('#docs-search-results [data-search-hit]');
        if (first) { e.preventDefault(); first.click(); closeSearch(); }
      } else if (e.key === 'Escape') { closeSearch(); input.blur(); }
      else if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); input.focus(); }
    });
    // CAPTURE phase, and deliberately separate from the bubble-phase listener
    // below: a search hit for the CURRENT page must be intercepted before
    // htmx's own hx-get click handling on that anchor (bound directly on the
    // element by htmx.process(), a normal bubble-phase listener) ever runs.
    // Originally this same-page short-circuit lived in the bubble-phase
    // listener below and called e.preventDefault() there -- confirmed live,
    // via network-request tracing, that this was too late: capture goes
    // top-down and reaches document (a bubble-phase listener) only AFTER
    // the event has already passed through the target's own listeners, so
    // htmx had already fired its own GET for the current page by the time
    // that preventDefault() ran. That produced a redundant fetch AND a
    // second, htmx-driven applySwappedPage()/scrollToHashTarget() cycle
    // racing the direct one below. Registering here instead -- with
    // e.stopPropagation() -- runs before the event ever reaches the anchor,
    // so htmx's listener on it never fires at all for this click.
    document.addEventListener('click', function (e) {
      var hit = e.target.closest('[data-search-hit]');
      if (!hit) return;
      // A home-page href (root, e.g. './' or '../') has no filename segment
      // at all -- split('/').pop() on it yields '' (the empty string after
      // the trailing slash), not 'index.html'. Without the `|| 'index.html'`
      // fallback on BOTH sides, a same-page hit on the home page's own
      // sections would never match here (hitPage '' !== currentPage
      // 'index.html', which already had this same fallback) and would fall
      // through to htmx's normal cross-page handling for what should be an
      // instant scroll.
      var hitPage = hit.getAttribute('href').split('#')[0].split('/').pop() || 'index.html';
      var currentPage = location.pathname.split('/').pop() || 'index.html';
      if (hitPage !== currentPage) return; // cross-page: let it reach htmx normally
      e.preventDefault();
      e.stopPropagation();
      closeSearch();
      history.pushState(null, '', hit.getAttribute('href'));
      scrollToHashTarget(true);
    }, true);
    document.addEventListener('click', function (e) {
      // Same-page hits are already fully handled (and stopped) by the
      // capture-phase listener above; this only ever sees cross-page hits
      // and plain "click outside" cases.
      if (e.target.closest('[data-search-hit]')) { closeSearch(); }
      else if (!e.target.closest('.docs-search')) { closeSearch(); }
    });
  }
  function closeSearch() {
    var panel = document.getElementById('docs-search-results');
    var input = document.getElementById('docs-search');
    if (panel) { panel.classList.remove('is-open'); panel.innerHTML = ''; }
    if (input) input.value = '';
  }

  /* Per-page "on this page" TOC (pilot: docs/superpowers/specs/2026-07-31-per-page-toc-design.md).
     A page's own markup only needs a `[data-toc-link]` anchor (href="#sectionId") per
     entry -- open/close of the panel itself is already fully declarative
     (data-wui-toggle/data-wui-anchor/data-wui-dismiss, handled by weoc-ui.js). This is
     the one bit that isn't declarative: turning that click into the same scroll+flash
     search hits already use, without letting htmx's boost try to "navigate" to a
     same-page hash first. Bound once, document-level, like bindSearch()/bindHtmxNav()
     above -- docs-shell.js itself is loaded once and outlives every SPA swap, so this
     never needs re-binding per page. */
  var tocLinksBound = false;
  function bindTocLinks() {
    if (tocLinksBound) return;
    tocLinksBound = true;
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-toc-link]');
      if (!link) return;
      e.preventDefault();
      history.pushState(null, '', link.getAttribute('href'));
      scrollToHashTarget(true);
      // The panel also carries data-wui-dismiss on each item (closes it via
      // weoc-ui.js's own bubble-phase listener on the same click) -- nothing
      // further to do here for that half.
    });
  }

  window.DocShell = {
    /* Access the global Alpine store. Returns the 'docs' store object,
       or null if Alpine hasn't initialised yet. */
    store: function () {
      return window.Alpine ? window.Alpine.store('docs') : null;
    },
    // Exposed so page-level Alpine components (e.g. tinymce.html) can reach
    // these without duplicating them locally -- both are private to this
    // file's own closure otherwise.
    agencyThemeFile: agencyThemeFile,
    activePalette: activePalette,
    init: function (activeKey) {
      var root = getRoot();
      var shared = root + '../';
      // Every page passes its key explicitly (verified: all 29 docs/docs/*.html
      // plus docs/index.html call DocShell.init('<key>')). The old
      // data-barba-namespace fallback was dropped in c6624ff along with the
      // attribute itself; 'home' is the only fallback left.
      var ns = activeKey || 'home';

      // Inject a dedicated link so loadTheme() has a swappable target.
      // weoc-ui-core.css @imports agency-theme internally (resolved at parse time,
      // never a <link> element). This explicit link cascades after that @import,
      // so its :root block wins — and we can swap its href for theme switching.
      ensureCSS(shared + 'CSS/weoc-ui/agency-theme.css');
      // Freeze the link to an ABSOLUTE href immediately. The SPA router changes
      // location via pushState; the browser RE-RESOLVES a link's relative href
      // against the new URL, so a cross-depth navigation would repoint this
      // stylesheet to a 404 and break theming until a full reload. Locking the
      // resolved absolute URL into the attribute makes it depth-immune.
      var _agencyLink = getAgencyThemeLink();
      if (_agencyLink) _agencyLink.setAttribute('href', _agencyLink.href);
      applyStoredTheme();
      renderChrome(ns, root);
      hookThemeReadout();
      hookThemeSwatches();
      var splitEl = document.getElementById('docs-split');
      var hdrEl = document.getElementById('docs-hdr');
      // #docs-split (sidebar/content) and #docs-hdr (header/search) are
      // SIBLINGS in the page markup, not nested — hx-boost only boosts
      // descendants of the element carrying it, so both containers need the
      // same attributes set independently, or links inside the header
      // (search results, brand link) silently fall back to full page loads.
      //
      // hx-select="#docs-main > *" (the CHILDREN of the incoming page's
      // #docs-main) + hx-swap="innerHTML". Both halves of that pairing are
      // load-bearing; the two obvious alternatives are each broken:
      //   - hx-select="#docs-main" + innerHTML puts the fetched #docs-main
      //     INSIDE the local #docs-main, producing a duplicate id.
      //   - hx-select="#docs-main" + outerHTML avoids the duplicate id but
      //     DETACHES the local #docs-main on every swap, which breaks all
      //     navigation coordination: htmx resolves a request's swap target
      //     at dispatch time and holds it across the whole swap/settle delay
      //     window below (500ms + 630ms). If navigation B is dispatched
      //     while navigation A's window is still open, A's outerHTML swap
      //     detaches the very node B is targeting, so B's
      //     htmx:beforeSwap/afterSwap fire on a detached node and never
      //     bubble to document.body — where the latestNav token guard and
      //     applySwappedPage() (chrome re-render + i18n + page init +
      //     revealOut) are bound. B then "half-navigates": htmx's own
      //     title/history update lands, but the visible content, the sidebar
      //     active state, and the chrome's link roots (recomputed per URL
      //     depth by renderChrome) all stay stale — which can leave every
      //     sidebar/brand link 404ing.
      // Selecting the children instead gets both properties at once: no
      // duplicate id (the wrapper element itself is never inserted) and no
      // detachment (an innerHTML swap replaces the target's CONTENTS, so
      // the target node stays live in the document the whole time and its
      // swap events keep bubbling to document.body). hx-select with a
      // "#docs-main > *" selector collects ALL matching top-level children
      // (hero + sections, plus a leading <style> on pages like views.html),
      // not just the first.
      var swapSpec = htmxSwapSpec();
      var boostTargets = [splitEl, hdrEl];
      boostTargets.forEach(function (el) {
        if (!el) return;
        el.setAttribute('hx-boost', 'true');
        el.setAttribute('hx-target', '#docs-main');
        el.setAttribute('hx-select', '#docs-main > *');
        el.setAttribute('hx-swap', swapSpec);
        if (window.htmx) window.htmx.process(el);
      });
      bindSearch();
      bindHtmxNav();
      bindTocLinks();
      ensureI18nStore(root);

      window.DocShell.ready = ensureGlobalAssets(root).then(function () {
        // htmx loads lazily as one of ensureGlobalAssets' jobs, so the
        // htmx.process() calls above (at attribute-set time) almost always
        // no-op — window.htmx isn't defined yet. Re-process now that the
        // load is guaranteed complete, so hx-boost's click binding actually
        // attaches instead of silently falling back to full page
        // navigations (which never fire htmx:beforeSwap/afterSwap).
        if (window.htmx) boostTargets.forEach(function (el) { if (el) window.htmx.process(el); });
        entranceAnimate();
        runPageInit();
      });
    }
  };
})();
