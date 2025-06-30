import { applyAllConditions } from './applyAllConditions.js';
import { allRequiredFieldsFilled } from '../frontend.js';
import { debouncedSendToBackend } from '../frontend.js';

// ✅ Uses window.flatpickr from CDN — no import needed
export function bindInputTriggers(inputBox, contentSection, resultContainer) {
  const inputs = inputBox?.querySelectorAll("input, select, textarea");
  if (!inputs || !inputs.length) return;

  let hasSwitched = false;

  inputs.forEach(input => {
    // ✅ ✅ ✅ THIS IS THE ONLY CORRECT CONDITION
    if (input.classList.contains('ukpa-date-input')) {
      const wrapper = input.closest('.abishek-DatePicker');
      if (!wrapper) return;

      const display = wrapper.querySelector('.ukpa-date-display');
      const clickarea = wrapper.querySelector('.ukpa-date-clickarea');

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

      // ✅ ✅ ✅ Defensive: check flatpickr exists
      if (typeof window.flatpickr !== 'function') {
        console.error('Flatpickr is not loaded!');
        return;
      }

      const picker = window.flatpickr(input, {
        dateFormat: "d F Y",
        clickOpens: false,
        allowInput: true,
        onChange: (selectedDates, dateStr) => {
          updateDisplay(dateStr);
          applyAllConditions();
          if (!allRequiredFieldsFilled()) return;

          if (!hasSwitched) {
            if (contentSection) contentSection.style.display = "none";
            if (resultContainer) resultContainer.style.display = "flex";
            if (inputBox) inputBox.style.width = "60%";
            hasSwitched = true;
          }

          const collected = {};
          inputs.forEach(el => {
            const key = el.name || el.dataset.name || el.id;
            collected[key] = el.type === 'checkbox' ? el.checked : el.value;
          });
          debouncedSendToBackend(collected);
        }
      });

      if (picker) {
        clickarea?.addEventListener('click', () => picker.open());
        input.addEventListener('focus', () => picker.open());
      }

      updateDisplay(input.value);
      return; // ✅ Skip normal binding for this input
    }

    // ✅ ✅ ✅ Other inputs
    input.addEventListener("input", () => {
      applyAllConditions();
      if (!allRequiredFieldsFilled()) return;

      if (!hasSwitched) {
        if (contentSection) contentSection.style.display = "none";
        if (resultContainer) resultContainer.style.display = "flex";
        if (inputBox) inputBox.style.width = "60%";
        hasSwitched = true;
      }

      const collected = {};
      inputs.forEach(el => {
        const key = el.name || el.dataset.name || el.id;
        collected[key] = el.type === 'checkbox' ? el.checked : el.value;
      });

      debouncedSendToBackend(collected);
    });
  });
}
