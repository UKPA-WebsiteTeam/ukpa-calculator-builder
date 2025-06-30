import { evaluateConditions } from './modules/evaluateConditions.js';
import { applyAllConditions } from './modules/applyAllConditions.js';
import { renderResultsFrontend } from './modules/renderResultsFrontend.js';
import { sendToBackend, debounce } from './modules/sendToBackend.js';
import { bindInputTriggers } from './modules/bindInputTriggers.js';
import { resetForm } from './modules/resetForm.js';
import { scrollBar } from './modules/Scrollbar.js';
import { handleLeadSubmit } from '../js/modules/handleLeadSubmit.js';


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
  const inputBox = document.querySelector(".ab-input"); // ✅ OR document
  const contentSection = document.querySelector(".ab-content");
  const resultContainer = document.querySelector(".main-result-container");
  const breakdown = document.querySelector(".ab-breakdown-table");

  window.ukpaResults = {};
  resetForm(inputBox, contentSection, resultContainer, breakdown);

  applyAllConditions();
  scrollBar();

  // ✅ Bind safely
  bindInputTriggers(inputBox, contentSection, resultContainer, breakdown);

  window.renderResults = renderResultsFrontend;
  window.applyAllConditions = applyAllConditions;
  window.debouncedSendToBackend = debouncedSendToBackend;

  const form = document.querySelector('.ab-lead-form');
  if (form) form.addEventListener('submit', handleLeadSubmit);

  window.resetForm = () =>
    resetForm(inputBox, contentSection, resultContainer, breakdown);
});

