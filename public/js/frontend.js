import { evaluateConditions } from './modules/evaluateConditions.js';
import { applyAllConditions } from './modules/applyAllConditions.js';
import { renderResults } from './modules/renderResults.js';
import { sendToBackend } from './modules/sendToBackend.js';
import { bindInputTriggers } from './modules/bindInputTriggers.js';
import { resetForm } from './modules/resetForm.js';

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("ab-input-box");
  const contentSection = document.getElementById("ab-content-section");
  const resultContainer = document.getElementById("main-result-container");

  // Initial logic application
  applyAllConditions();

  // Bind dynamic triggers to inputs
  bindInputTriggers(inputBox, contentSection, resultContainer);

  // Render results if API has already returned something
  if (window.ukpaResults) {
    renderResults();
  }

  // Expose globally for external use
  window.renderResults = renderResults;
  window.applyAllConditions = applyAllConditions;
  window.sendToBackend = sendToBackend;

  // Global reset function hook
  window.resetForm = () => resetForm(inputBox, contentSection, resultContainer);
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
