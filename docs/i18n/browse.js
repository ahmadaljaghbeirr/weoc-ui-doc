/* weoc-ui docs i18n — browse (Browse Components showcase)
   Loaded directly from browse.html's own <head> (after weoc-ui.js), NOT via
   docs-shell.js's I18N_PAGES loader — 'browse' is deliberately not in that
   list so this page needs zero docs-shell.js edits (see
   docs/superpowers/specs/2026-07-31-browse-components-showcase-design.md).
   WUI.i18n.register() just appends to the shared store regardless of how/when
   it's called, so a direct <script> tag works identically to the lazy-loaded
   per-page files charts.js/kanban.js/etc. use. */
(function () {
  if (!window.WUI || !window.WUI.i18n) return;
  WUI.i18n.register([
    { lang:'en', id:'docs_browse_1', value:'weoc-ui — see it in action' }, { lang:'ar', id:'docs_browse_1', value:'weoc-ui — شاهدها في العمل' },
    { lang:'en', id:'docs_browse_2', value:'A curated tour of the library\'s most visual components. Click any tile to open its full documentation.' }, { lang:'ar', id:'docs_browse_2', value:'جولة منتقاة عبر أكثر مكوّنات المكتبة تأثيرًا بصريًا. انقر على أي بطاقة لفتح توثيقها الكامل.' },
    { lang:'en', id:'docs_browse_3', value:'<span class="material-symbols-outlined">show_chart</span>Charts' }, { lang:'ar', id:'docs_browse_3', value:'<span class="material-symbols-outlined">show_chart</span>المخططات' },
    { lang:'en', id:'docs_browse_4', value:'<span class="material-symbols-outlined">view_kanban</span>Kanban' }, { lang:'ar', id:'docs_browse_4', value:'<span class="material-symbols-outlined">view_kanban</span>كانبان' },
    { lang:'en', id:'docs_browse_5', value:'<span class="material-symbols-outlined">grid_on</span>Heatmap' }, { lang:'ar', id:'docs_browse_5', value:'<span class="material-symbols-outlined">grid_on</span>الخريطة الحرارية' },
    { lang:'en', id:'docs_browse_6', value:'<span class="material-symbols-outlined">calendar_month</span>Calendar' }, { lang:'ar', id:'docs_browse_6', value:'<span class="material-symbols-outlined">calendar_month</span>التقويم' },
    { lang:'en', id:'docs_browse_7', value:'<span class="material-symbols-outlined">speed</span>Gauge' }, { lang:'ar', id:'docs_browse_7', value:'<span class="material-symbols-outlined">speed</span>المقياس' },
    { lang:'en', id:'docs_browse_8', value:'<span class="material-symbols-outlined">donut_large</span>Donut' }, { lang:'ar', id:'docs_browse_8', value:'<span class="material-symbols-outlined">donut_large</span>المخطط الحلقي' },
    { lang:'en', id:'docs_browse_9', value:'<span class="material-symbols-outlined">trending_up</span>Progress' }, { lang:'ar', id:'docs_browse_9', value:'<span class="material-symbols-outlined">trending_up</span>التقدّم' },
    { lang:'en', id:'docs_browse_10', value:'<span class="material-symbols-outlined">calendar_today</span>Date Picker' }, { lang:'ar', id:'docs_browse_10', value:'<span class="material-symbols-outlined">calendar_today</span>منتقي التاريخ' },
    { lang:'en', id:'docs_browse_11', value:'<span class="material-symbols-outlined">view_agenda</span>Cards &amp; Containers' }, { lang:'ar', id:'docs_browse_11', value:'<span class="material-symbols-outlined">view_agenda</span>البطاقات والحاويات' },
    { lang:'en', id:'docs_browse_12', value:'<span class="material-symbols-outlined">sell</span>Badges &amp; Chips' }, { lang:'ar', id:'docs_browse_12', value:'<span class="material-symbols-outlined">sell</span>الشارات والرقائق' },
    { lang:'en', id:'docs_browse_13', value:'<span class="material-symbols-outlined">smart_button</span>Buttons' }, { lang:'ar', id:'docs_browse_13', value:'<span class="material-symbols-outlined">smart_button</span>الأزرار' },
    { lang:'en', id:'docs_browse_14', value:'<span class="material-symbols-outlined">table_rows</span>Tables' }, { lang:'ar', id:'docs_browse_14', value:'<span class="material-symbols-outlined">table_rows</span>الجداول' }
  ]);
})();
