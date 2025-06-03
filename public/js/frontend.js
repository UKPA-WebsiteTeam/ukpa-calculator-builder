import { evaluateConditions } from './modules/evaluateConditions.js';
import { applyAllConditions } from './modules/applyAllConditions.js';
import { renderResults } from './modules/renderResults.js';
import { sendToBackend } from './modules/sendToBackend.js';
import { bindInputTriggers } from './modules/bindInputTriggers.js';
import { resetForm } from './modules/resetForm.js';
import { scrollBar} from './modules/Scrollbar.js';

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.querySelector(".ab-input");
  const contentSection = document.querySelector(".ab-content");
  const resultContainer = document.querySelector(".main-result-container");
  const breakdown = document.querySelector(".ab-breakdown-table");

  // ✅ Always reset the form on page load to clear stale state
  window.ukpaResults = {}; // clear stale results
  resetForm(inputBox, contentSection, resultContainer,breakdown); // do not call renderResults here

  // Re-apply condition logic
  applyAllConditions();
  scrollBar(); // Initialize scrollbar state
  // Bind dynamic triggers to inputs
  bindInputTriggers(inputBox, contentSection, resultContainer,breakdown);

  // ✅ No renderResults on load
  // renderResults(); ← removed

  // Expose globally
  window.renderResults = renderResults;
  window.applyAllConditions = applyAllConditions;
  window.sendToBackend = sendToBackend;

  // Hook reset globally
  window.resetForm = () => resetForm(inputBox, contentSection, resultContainer,breakdown);
});

export function allRequiredFieldsFilled() {
  const requiredFields = document.querySelectorAll('[data-calc-required="true"]');

  for (const field of requiredFields) {
    if (field.closest('.ukpa-conditional')?.style.display === 'none') continue;

    if (
      (field.type === 'checkbox' && !field.checked) ||
      (field.type === 'radio' && !document.querySelector(`input[name="${field.name}"]:checked`)) ||
      (!['checkbox', 'radio'].includes(field.type) && !field.value?.trim())
    ) {
      return false;
    }
  }

  return true;
}
