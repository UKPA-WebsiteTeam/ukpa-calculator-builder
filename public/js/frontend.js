import { evaluateConditions } from './modules/evaluateConditions.js';
import { applyAllConditions } from './modules/applyAllConditions.js';
import { renderResultsFrontend } from './modules/renderResultsFrontend.js';
import { sendToBackend, debounce } from './modules/sendToBackend.js';
import { bindInputTriggers } from './modules/bindInputTriggers.js';
import { resetForm } from './modules/resetForm.js';
import { scrollBar } from './modules/Scrollbar.js';

// ✅ Debounced sendToBackend exposed to window and bindings
export const debouncedSendToBackend = debounce(sendToBackend, 500);

// ✅ Check if all required fields are filled
export function allRequiredFieldsFilled() {
  const requiredFields = document.querySelectorAll('[data-calc-required="true"]');

  for (const field of requiredFields) {
    // Skip hidden conditionally excluded fields
    if (field.closest('.ukpa-conditional')?.style.display === 'none') continue;

    const type = field.type;
    const value = field.value?.trim();

    if (
      (type === 'checkbox' && !field.checked) ||
      (type === 'radio' && !document.querySelector(`input[name="${field.name}"]:checked`)) ||
      (!['checkbox', 'radio'].includes(type) && !value)
    ) {
      return false;
    }
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.querySelector(".ab-input");
  const contentSection = document.querySelector(".ab-content");
  const resultContainer = document.querySelector(".main-result-container");
  const breakdown = document.querySelector(".ab-breakdown-table");

  // ✅ Clear results on load
  window.ukpaResults = {};
  resetForm(inputBox, contentSection, resultContainer, breakdown);

  // ✅ Setup logic and UI
  applyAllConditions();
  scrollBar();
  bindInputTriggers(inputBox, contentSection, resultContainer, breakdown);

  // ✅ Make tools globally accessible (for testing or re-use)
  window.renderResults = renderResultsFrontend;
  window.applyAllConditions = applyAllConditions;
  window.debouncedSendToBackend = debouncedSendToBackend;

  // ✅ Manual reset via window
  window.resetForm = () =>
    resetForm(inputBox, contentSection, resultContainer, breakdown);
});