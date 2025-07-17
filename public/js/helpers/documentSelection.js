import { updateVisibleDocumentDetails } from './updateVisibleDocumentDetails.js';

export function initDocumentSelection() {
  document.querySelectorAll('[required]').forEach(el => el.removeAttribute('required'));

  const groupA = document.querySelectorAll('#groupA-checkboxes input[type="checkbox"]');
  const groupB = document.querySelectorAll('#groupB-checkboxes input[type="checkbox"]');
  const groupALabelText = document.getElementById('groupA-label-text');
  const groupBLabelText = document.getElementById('groupB-label-text');

  function updateDropdownLabel(checkboxes, labelElement, placeholderText) {
    const selectedDocs = Array.from(checkboxes).filter(cb => cb.checked);

    if (selectedDocs.length === 0) {
      labelElement.innerHTML = placeholderText;
      return;
    }

    labelElement.innerHTML = selectedDocs.map(cb => {
      const docName = cb.parentElement.textContent.trim();
      const docValue = cb.value;
      return `
        <span class="doc-pill" data-doc="${docValue}">
          ${docName} <span class="doc-remove" title="Remove">✕</span>
        </span>
      `;
    }).join('');
  }

  function updateDocCountDisplay() {
    const count = document.querySelectorAll('#groupA-checkboxes input:checked, #groupB-checkboxes input:checked').length;
    document.getElementById('docSelectionCount').textContent = `Documents selected: ${count} of 2`;
  }

  function updateDocSelection(e) {
    const aCount = Array.from(groupA).filter(cb => cb.checked).length;
    const bCount = Array.from(groupB).filter(cb => cb.checked).length;
    const total = aCount + bCount;

    if (bCount > 1) {
      alert("❌ You can select only ONE document from Group B.");
      e.target.checked = false;
      return;
    }

    if (total > 2) {
      alert("❌ You can only select a total of TWO documents from Group A and B combined.");
      e.target.checked = false;
      return;
    }

    const disable = total >= 2;
    groupA.forEach(cb => cb.disabled = !cb.checked && disable);
    groupB.forEach(cb => cb.disabled = !cb.checked && (disable || bCount >= 1));
    updateDocCountDisplay();
    updateVisibleDocumentDetails();
  }

  groupA.forEach(cb => {
    cb.addEventListener('change', function (e) {
      updateDropdownLabel(groupA, groupALabelText, 'Select (maximum two) documents');
      updateDocSelection(e);
    });
  });

  groupB.forEach(cb => {
    cb.addEventListener('change', function (e) {
      updateDropdownLabel(groupB, groupBLabelText, 'Select (any one) document');
      updateDocSelection(e);
    });
  });

  updateDocCountDisplay();
}

function toggleNameFields(el) {
  const show = el.value === 'no';
  document.getElementById('updatedNameFields').style.display = show ? 'grid' : 'none';
}
