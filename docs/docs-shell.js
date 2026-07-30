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
        { key: 'tokens', label: 'Design Tokens', file: 'tokens.html', kw: 'tokens color spacing radius shadow theme palette dark light' },
        { key: 'tier-colors', label: 'Tier Colors', file: 'tier-colors.html', kw: 'tier activation 1 2 3 4 emergency accent' }
      ]
    },
    {
      group: 'Layout',
      items: [
        { key: 'layout', label: 'Layout & Shell', file: 'layout.html', kw: 'appshell page-shell split splitter scroll-area toolbar tab widget dashboard fill-area body-shell' },
        { key: 'grid', label: 'Grid & Flex', file: 'grid.html', kw: 'grid flex container row col group stack simplegrid gap space bento' }
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
        { key: 'navigation', label: 'Navigation', file: 'navigation.html', kw: 'tabs anchor link band header hdr banner breadcrumbs stepper' }
      ]
    },
    {
      group: 'Feedback',
      items: [
        { key: 'feedback', label: 'Feedback', file: 'feedback.html', kw: 'alert callout banner toast snackbar alarm skeleton empty-state loader spinner notification' },
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
        { key: 'indicators', label: 'Indicators', file: 'indicators.html', kw: 'avatar status-dot indicator icon-bubble themeicon level elapsed' },
        { key: 'tables', label: 'Tables', file: 'tables.html', kw: 'table standard cards log row column sticky sortable' }
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
        { key: 'views', label: 'Board Views', file: 'views.html', kw: 'display input details remove board view scaffold zone' },
        { key: 'maps', label: 'Maps', file: 'maps.html', kw: 'map esri basemap point popover controls location' }
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
     Called on first load AND after every Barba navigation — re-rendering the
     sidebar with the CURRENT root keeps relative links correct across the
     root/docs directory boundary, and refreshes the active item + title. */
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

  /* Load the EN/AR translation store once (site-wide), then re-localize.
     docs-i18n.js calls WUI.i18n.register([...]) at parse. Loaded via `root`
     so it resolves at any page depth. */
  var i18nStoreLoaded = false;
  // Per-page translation files (chrome + several pages live in docs-i18n.js;
  // the rest are one file each under i18n/ to keep them maintainable).
  var I18N_PAGES = ['cards', 'calendar', 'tokens', 'motion', 'charts', 'containers',
    'feedback', 'js-api', 'views', 'grid', 'forms', 'layout', 'home', 'conventions', 'kpi-recipes'];
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
    // site-wide because Barba never re-processes incoming <head> link tags.
    ['tom-select.min.css', 'tom-select-agency.css',
     'flatpickr.min.css', 'flatpickr-agency.css',
     'tinymce-theme.css'].forEach(function (f) {
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
    /* Barba removed — navigation is now the Alpine-driven fetch/swap router below. */
    if (!window.WUICalendar) jobs.push(loadScript(shared + 'JS/weoc-calendar.js'));
    if (!window.TomSelect)   jobs.push(loadScript(shared + 'JS/tom-select.complete.min.js'));
    if (!window.flatpickr)   jobs.push(loadScript(shared + 'JS/flatpickr.min.js'));
    if (!window.uPlot)       jobs.push(loadScript(shared + 'JS/uPlot.iife.min.js'));
    if (!window.EOCLists)    jobs.push(loadScript(shared + 'JS/eoc-lists.js'));
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
          // PAGE_INIT functions write into page.* for x-data blocks on
          // that page. Alpine destroys element-bound scopes automatically
          // when Barba removes the old container — no manual cleanup needed.
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
      return Promise.all(jobs2);
    });
  }

  /* ── Per-page behavior, keyed by namespace ────────────────────────────────
     Lives here (not in page-level inline <script>) so it re-runs after a
     Barba swap, where inline scripts in <body> do NOT re-execute. */
  var PAGE_INIT = {};

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
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
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

  function runPageInit(ns) {
    renderDemos(document);
    bindDemoCopy();
    if (PAGE_INIT[ns]) { try { PAGE_INIT[ns](); } catch (e) {} }
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

  /* ── htmx swap lifecycle (Barba- and hand-rolled-router-free) ────────────
     htmx owns navigation (hx-boost on #docs-split, set in DocShell.init).
     We hang chrome re-render + PAGE_INIT + the GSAP curtain off htmx's own
     documented swap/settle delay window instead of overriding htmx's
     internal swap/history handling (that interaction is undocumented and
     was deliberately avoided — see plan Task 2 header note). */
  function rootForPath(path) {
    return /weoc-ui-docs\.html$/.test((path || '').replace(/\\/g, '/')) ? './' : '../';
  }
  function nsForUrl(url) {
    var clean = (url || '').split('#')[0].split('?')[0];
    var file = clean.split('/').pop();
    if (/weoc-ui-docs\.html$/.test(clean) || file === '') return 'home';
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

  /* Apply an already-fetched page's content: renderChrome + i18n re-apply +
     PAGE_INIT + the GSAP reveal. Shared by both the htmx:afterSwap listener
     (which already has the swapped-in DOM from evt.detail) and the popstate
     listener (which does its own separate fetch) — only the fetching differs
     between the two call sites, everything after "we know ns/root and the
     new content is already in #docs-main" lives here once. */
  function applySwappedPage(ns, root) {
    renderChrome(ns, root);
    if (window.WUI && window.WUI.i18n) window.WUI.i18n.apply(document);
    runPageInit(ns);
    revealOut(document.getElementById('docs-main'));
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
          var ns = nsForUrl(url);
          var root = rootForPath(url);
          applySwappedPage(ns, root);
        })
        .catch(function () { location.reload(); });
    });
  }

  /* ── Search (over NAV labels + keywords) ──────────────────────────────────*/
  var searchBound = false;
  function searchMatches(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/), out = [];
    for (var i = 0; i < NAV.length; i++)
      for (var j = 0; j < NAV[i].items.length; j++) {
        var it = NAV[i].items[j];
        var hay = (it.label + ' ' + NAV[i].group + ' ' + (it.kw || '')).toLowerCase();
        var ok = true;
        for (var t = 0; t < terms.length; t++) if (hay.indexOf(terms[t]) === -1) { ok = false; break; }
        if (ok) out.push({ group: NAV[i].group, item: it });
      }
    return out.slice(0, 12);
  }
  function renderSearchResults(q) {
    var panel = document.getElementById('docs-search-results');
    if (!panel) return;
    var res = searchMatches(q);
    if (!res.length) { panel.innerHTML = q ? '<div class="docs-search-empty">No matches</div>' : ''; panel.classList.toggle('is-open', !!q); return; }
    var root = getRoot(), html = '';
    for (var i = 0; i < res.length; i++) {
      var href = getHref(res[i].item, root);
      html += '<a class="docs-search-hit" href="' + href + '" data-search-hit>' +
        '<span class="docs-search-hit-label">' + res[i].item.label + '</span>' +
        '<span class="docs-search-hit-group">' + res[i].group + '</span></a>';
    }
    panel.innerHTML = html;
    panel.classList.add('is-open');
  }
  function bindSearch() {
    if (searchBound) return;
    searchBound = true;
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'docs-search') renderSearchResults(e.target.value);
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
    document.addEventListener('click', function (e) {
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
      var container = document.getElementById('docs-main');
      var ns = activeKey ||
        (container && container.getAttribute('data-barba-namespace')) || 'home';

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
      if (splitEl) {
        splitEl.setAttribute('hx-boost', 'true');
        splitEl.setAttribute('hx-target', '#docs-main');
        splitEl.setAttribute('hx-select', '#docs-main');
        splitEl.setAttribute('hx-swap', 'innerHTML swap:500ms settle:630ms');
        if (window.htmx) window.htmx.process(splitEl);
      }
      bindSearch();
      bindHtmxNav();
      ensureI18nStore(root);

      window.DocShell.ready = ensureGlobalAssets(root).then(function () {
        // htmx loads lazily as one of ensureGlobalAssets' jobs, so the
        // htmx.process(splitEl) call above (at attribute-set time) almost
        // always no-ops — window.htmx isn't defined yet. Re-process now that
        // the load is guaranteed complete, so hx-boost's click binding
        // actually attaches instead of silently falling back to full
        // page navigations (which never fire htmx:beforeSwap/afterSwap).
        if (window.htmx && splitEl) window.htmx.process(splitEl);
        entranceAnimate();
        runPageInit(ns);
      });
    }
  };
})();
