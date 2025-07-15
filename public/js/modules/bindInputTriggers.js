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

    // 👉 Helper: Add commas as thousand separators while preserving decimals
    const formatWithCommas = (val) => {
      if (typeof val !== 'string') val = String(val ?? '');
      const [intPart, decPart] = val.replace(/,/g, '').split('.');
      if (!intPart) return '';
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
    };

    // 🖌️ Format default value on load (for number inputs)
    if (input.classList.contains('ukpa-number-input') && input.value) {
      const raw = input.value.replace(/,/g, '');
      if (!isNaN(raw) && raw !== '') {
        input.value = formatWithCommas(raw);
      }
    }

    // --- Improved number input handling ---
    if (input.classList.contains('ukpa-number-input')) {
      // Allow only numbers and a single decimal point
      input.addEventListener('input', (e) => {
        let val = input.value.replace(/,/g, '');
        // Allow only digits and one decimal point
        val = val.replace(/[^\d.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) {
          val = parts[0] + '.' + parts.slice(1).join('');
        }
        input.value = val;
        // Do not format with commas on input, only on blur
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
      // Format with commas on blur, but only if valid number
      input.addEventListener('blur', () => {
        const raw = input.value.replace(/,/g, '');
        // Only format if raw is a valid number (not empty, not just a dot, not NaN)
        if (raw !== '' && isFinite(raw) && /^[0-9]+(\.[0-9]*)?$/.test(raw)) {
          input.value = formatWithCommas(raw);
        }
        // else leave as-is (do not reset/clear)
      });
      // Remove formatting on focus for easier editing
      input.addEventListener('focus', () => {
        input.value = input.value.replace(/,/g, '');
      });
      return; // Skip the generic input handler for number fields
    }

    // --- Generic input handler for other fields ---
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

