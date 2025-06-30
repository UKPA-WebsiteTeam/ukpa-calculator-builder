export function initDateDisplayFormatter(input) {
  if (!input || input.type !== 'date') return;

  const wrapper = input.closest('.ukpa-date-wrapper');
  const display = wrapper?.querySelector('.ukpa-date-display');
  const clickarea = wrapper?.querySelector('.ukpa-date-clickarea');

  if (!wrapper || !display) return;

  const updateDisplay = (val) => {
    if (!val || isNaN(new Date(val))) {
      display.textContent = 'Month Date, Year';
      display.classList.add('ukpa-date-display-empty');
    } else {
      const date = new Date(val);
      display.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
      display.classList.remove('ukpa-date-display-empty');
    }
  };

  clickarea?.addEventListener('click', () => input.focus());

  input.addEventListener('change', () => {
    updateDisplay(input.value);
  });

  // ❗ Wait for DOM + value to hydrate
  setTimeout(() => {
    updateDisplay(input.value);
  }, 10);
}
