// builderBindInputTriggers.js
export function bindInputTriggers(inputBox) {
  const inputs = inputBox?.querySelectorAll("input.ukpa-date-input");
  if (!inputs) return;

  inputs.forEach(input => {
    const wrapper = input.closest('.abishek-DatePicker');
    const display = wrapper?.querySelector('.ukpa-date-display');
    const clickarea = wrapper?.querySelector('.ukpa-date-clickarea');

    const updateDisplay = (val) => {
      if (!display) return;
      if (!val) {
        display.textContent = 'Month Date, Year';
        display.classList.add('ukpa-date-display-empty');
      } else {
        display.textContent = val;
        display.classList.remove('ukpa-date-display-empty');
      }
    };

    const picker = window.flatpickr(input, {
      dateFormat: "d F Y",
      clickOpens: false,
      allowInput: true,
      onChange: (selectedDates, dateStr) => {
        updateDisplay(dateStr);
      },
    });

    if (clickarea) {
      clickarea.addEventListener('click', () => {
        picker.open();
      });
    }

    input.addEventListener('focus', () => {
      picker.open();
    });

    updateDisplay(input.value);
  });
}
