/*! flatpickr-l10n-ar.js — Arabic locale for flatpickr v4.6.13
 *  Load AFTER flatpickr.min.js (registers onto the global flatpickr.l10ns.ar,
 *  the same slot flatpickr's own official l10n/ar.js would occupy).
 *  Gulf/UAE convention: week starts Sunday, 24-hour time display.
 */
(function () {
  if (typeof flatpickr === 'undefined') {
    console.warn('[flatpickr-l10n-ar] flatpickr core not loaded yet — load this file after flatpickr.min.js.');
    return;
  }

  flatpickr.l10ns.ar = {
    weekdays: {
      shorthand: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
      longhand: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    },
    months: {
      shorthand: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      longhand: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    },
    firstDayOfWeek: 0,
    ordinal: function () { return ''; },
    rangeSeparator: ' إلى ',
    weekAbbreviation: 'أسبوع',
    scrollTitle: 'قم بالتمرير للزيادة',
    toggleTitle: 'انقر للتبديل',
    amPM: ['ص', 'م'],
    time_24hr: true,
  };
})();
