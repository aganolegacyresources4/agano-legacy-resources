/* Plain browser JavaScript. No modules or dependencies. */
(function () {
  "use strict";
function initFilters() {
  document.querySelectorAll('[data-filter-controls]').forEach(bar => {
    if (bar.dataset.filtersReady) return;
    const type = bar.dataset.filterControls;
    const list = document.querySelector(`[data-filter-list="${type}"]`);
    if (!list) return;
    const items = [...list.querySelectorAll('[data-filter-item]')];
    const fields = [...bar.querySelectorAll('[data-filter]')];
    const counter = bar.querySelector('[data-filter-count]');
    const noResults = list.parentElement.querySelector('[data-filter-empty]');
    bar.dataset.filtersReady = 'true';
    if (counter) {
      counter.setAttribute('aria-live', 'polite');
      counter.setAttribute('aria-atomic', 'true');
    }
    function apply() {
      let count = 0;
      items.forEach(item => {
        const show = fields.every(field => field.value === 'all' || item.dataset[field.dataset.filter] === field.value);
        item.hidden = !show;
        if (show) count++;
      });
      if (counter) counter.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
      if (noResults) noResults.hidden = count > 0 || items.length === 0;
      bar.classList.toggle('is-active', fields.some(field => field.value !== 'all'));
      fields.forEach(field => field.classList.toggle('is-active', field.value !== 'all'));
    }
    fields.forEach(field => field.addEventListener('change', apply));
    bar.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
      fields.forEach(f => f.value = 'all');
      apply();
    });
    apply();
  });
}

  window.AGANO = window.AGANO || {};
  window.AGANO.initFilters = initFilters;
})();
