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

      if (input && !input._flatpickr) {
        const picker = window.flatpickr(input, {
          dateFormat: "d F Y", // display format only
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
    }

    // ✅ ✅ ✅ Other inputs

    // 👉 Helper: Add commas as thousand separators while preserving decimals
    const formatWithCommas = (val) => {
      if (typeof val !== 'string') val = String(val ?? '');
      // Remove existing commas first
      const [intPart, decPart] = val.replace(/,/g, '').split('.');
      // Guard: if nothing to format
      if (!intPart) return '';

      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
    };

    // 🖌️ Format default value on load
    if (input.classList.contains('ukpa-number-input') && input.value) {
      input.value = formatWithCommas(String(input.value));
    }

    input.addEventListener("input", () => {
      // 🧮 Auto-format number inputs with commas
      if (input.classList.contains('ukpa-number-input')) {
        const cursorStart = input.selectionStart;
        const rawBeforeFormat = input.value;
        const formatted = formatWithCommas(rawBeforeFormat);
        input.value = formatted;
        // Attempt to preserve caret position (rough approximation)
        const diff = formatted.length - rawBeforeFormat.length;
        const newPos = (cursorStart ?? formatted.length) + diff;
        try {
          input.setSelectionRange(newPos, newPos);
        } catch (err) {
          // Silent: may fail if element not focusable yet
        }
      }

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

