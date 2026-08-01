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
    { lang:'en', id:'docs_browse_3', value:'Charts' }, { lang:'ar', id:'docs_browse_3', value:'المخططات' },
    { lang:'en', id:'docs_browse_4', value:'Kanban' }, { lang:'ar', id:'docs_browse_4', value:'كانبان' },
    { lang:'en', id:'docs_browse_5', value:'Heatmap' }, { lang:'ar', id:'docs_browse_5', value:'الخريطة الحرارية' },
    { lang:'en', id:'docs_browse_6', value:'Calendar' }, { lang:'ar', id:'docs_browse_6', value:'التقويم' },
    { lang:'en', id:'docs_browse_7', value:'Gauge' }, { lang:'ar', id:'docs_browse_7', value:'المقياس' },
    { lang:'en', id:'docs_browse_8', value:'Donut' }, { lang:'ar', id:'docs_browse_8', value:'المخطط الحلقي' },
    { lang:'en', id:'docs_browse_9', value:'Progress' }, { lang:'ar', id:'docs_browse_9', value:'التقدّم' },
    { lang:'en', id:'docs_browse_10', value:'Form Controls — date, select & field' }, { lang:'ar', id:'docs_browse_10', value:'عناصر النموذج: تاريخ وقائمة اختيار وحقل' },
    { lang:'en', id:'docs_browse_11', value:'Cards & Containers' }, { lang:'ar', id:'docs_browse_11', value:'البطاقات والحاويات' },
    { lang:'en', id:'docs_browse_12', value:'Badges & Chips' }, { lang:'ar', id:'docs_browse_12', value:'الشارات والرقائق' },
    { lang:'en', id:'docs_browse_13', value:'Buttons' }, { lang:'ar', id:'docs_browse_13', value:'الأزرار' },
    { lang:'en', id:'docs_browse_14', value:'Tables' }, { lang:'ar', id:'docs_browse_14', value:'الجداول' },
    { lang:'en', id:'docs_browse_15', value:'Records — list with actions popover' }, { lang:'ar', id:'docs_browse_15', value:'السجلات: قائمة مع قائمة إجراءات منبثقة' }
  ]);
})();
