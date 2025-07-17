import { updateVisibleDocumentDetails } from './helpers/updateVisibleDocumentDetails.js';
import { nextStep, previousStep, showPreview, goBackToStep2 } from './helpers/stepNavigation.js';
import { toggleDropdown } from './helpers/toggleDropdown.js';
import { toggleNameFields } from './helpers/toggleNameFields.js';
import { loadCountries } from './helpers/loadCountries.js';
import { initDocumentSelection } from './helpers/documentSelection.js';
import { initFileUploadPreview } from './helpers/fileUploadPreview.js';
import { handleFinalSubmission } from './helpers/handleFinalSubmission.js';
import { validateName } from './helpers/validateName.js';

// Make dropdown toggle available globally for inline HTML onclick
window.toggleDropdown = toggleDropdown;

document.addEventListener('DOMContentLoaded', async () => {
  // ✅ Name validation on input
  document.querySelectorAll(
    'input[name="firstName"], input[name="middleName"], input[name="lastName"], input[name="statementName"]'
  ).forEach(input => {
    input.addEventListener('input', () => validateName(input));
  });

  // ✅ Bind buttons
  const nextBtnStep1 = document.getElementById("nextBtnStep1");
  const previewBtn = document.getElementById("previewBtn");
  const editBtn = document.getElementById("editBtn");
  const prevBtn = document.getElementById("previousBtn");
  const submitButton = document.querySelector('.submitButton');

  if (nextBtnStep1) nextBtnStep1.addEventListener("click", nextStep);
  if (previewBtn) previewBtn.addEventListener("click", showPreview);
  if (editBtn) editBtn.addEventListener("click", goBackToStep2);
  if (prevBtn) prevBtn.addEventListener("click", previousStep);
  if (submitButton) submitButton.addEventListener('click', handleFinalSubmission);

  // ✅ Init modules
  await loadCountries();
  initDocumentSelection();
  initFileUploadPreview();

  // ✅ Datepicker restrictions
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const hundredYearsAgo = new Date(today.setFullYear(today.getFullYear() - 100)).toISOString().split('T')[0];

  const dobInputs = document.querySelectorAll('input[name="dob"]');
  dobInputs.forEach(input => {
    input.setAttribute('max', todayStr);
    input.setAttribute('min', hundredYearsAgo);
  });

  const expiryInputs = document.querySelectorAll('.expiryDate');
  expiryInputs.forEach(input => {
    input.setAttribute('min', todayStr);
  });
});

// ✅ Hide dropdowns when clicking outside
document.addEventListener('click', function (e) {
  const isDropdownButton = e.target.closest('.dropdown-button');
  const isDropdownContent = e.target.closest('.dropdown-content');
  if (!isDropdownButton && !isDropdownContent) {
    document.querySelectorAll('.dropdown-content').forEach(dd => dd.style.display = 'none');
  }
});

// ✅ Handle removing doc pill badges
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('doc-remove')) {
    const pill = e.target.closest('.doc-pill');
    const docValue = pill.getAttribute('data-doc');
    const checkbox = document.querySelector(`input[type="checkbox"][value="${docValue}"]`);
    if (checkbox) {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
    }
  }
});
