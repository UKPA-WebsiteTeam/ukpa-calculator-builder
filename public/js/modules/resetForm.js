import { applyAllConditions } from './applyAllConditions.js';
import { bindInputTriggers } from './bindInputTriggers.js';
import { renderResultsFrontend } from './renderResultsFrontend.js';

export function resetForm(inputBox, contentSection, resultContainer) {
  const form = inputBox?.querySelector('form');
  if (!form) {
    console.warn("Form not found in #ab-input-box");
    return;
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    const tag = field.tagName.toLowerCase();
    if (tag === 'select') {
      const fallback = field.getAttribute('data-reset-default');
      field.value = fallback || field.options?.[0]?.value || '';
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = false;
    } else {
      field.value = '';
    }
  });

  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  document.querySelectorAll('.ab-main-result-value').forEach(el => el.textContent = '--');
  document.querySelectorAll('.ab-breakdown-table').forEach(el => el.innerHTML = '');

  if (contentSection) contentSection.style.display = "block";
  if (resultContainer) resultContainer.style.display = "none";
  if (inputBox) inputBox.style.width = "35%";

  applyAllConditions();
  bindInputTriggers(inputBox, contentSection, resultContainer);
  renderResultsFrontend();
}
