// builderBindInputTriggers.js
export function bindInputTriggers(inputBox) {
  const inputs = inputBox?.querySelectorAll("input");
  if (!inputs) return;

  inputs.forEach(input => {
    // Handle number inputs formatting
    const wrapper = input.closest('.ukpa-element');
    if (wrapper?.dataset.type === 'number') {
      input.addEventListener('input', () => {
        const rawValue = input.value.replace(/,/g, '');
        const parsed = rawValue.replace(/[^0-9.-]/g, '');
        if (parsed === '' || isNaN(parsed)) {
          input.value = '';
        } else {
          const [intPart, decPart] = parsed.split('.');
          const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          input.value = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
        }
      });
    }
  });

  // Filter date inputs for date picker binding
  const dateInputs = inputBox?.querySelectorAll("input.ukpa-date-input");
  if (!dateInputs) return;

  dateInputs.forEach(input => {
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
