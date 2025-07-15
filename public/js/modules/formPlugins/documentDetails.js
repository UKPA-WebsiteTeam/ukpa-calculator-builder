// documentDetails.js

// Full Group A and Group B document lists from idvform-ocr.html
const groupADocuments = [
  { id: 'passport', label: 'Passport', details: [
    { type: 'file', name: 'passportUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'passportNumber', label: 'Passport Number', required: true },
    { type: 'date', name: 'passportExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'passportCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'irish_passport', label: 'Irish Passport Card', details: [
    { type: 'file', name: 'irishPassportUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'irishPassportNumber', label: 'Passport Card Number', required: true },
    { type: 'date', name: 'irishPassportExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'irishPassportCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'biometric_id', label: 'EU Biometric ID Card', details: [
    { type: 'file', name: 'biometricIdUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'biometricIdNumber', label: 'ID Number', required: true },
    { type: 'date', name: 'biometricIdExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'biometricIdCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'brp', label: 'UK Biometric Residence Permit', details: [
    { type: 'file', name: 'brpUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'brpNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'brpExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'brpCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'brc', label: 'UK Biometric Residence Card', details: [
    { type: 'file', name: 'brcUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'brcNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'brcExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'brcCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'pass_card', label: 'UK Accredited PASS Card', details: [
    { type: 'file', name: 'passCardUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'passCardNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'passCardExpiry', label: 'Expiry Date', required: false },
    { type: 'select', name: 'passCardCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'tachograph', label: 'UK/EU Tachograph Card', details: [
    { type: 'file', name: 'tachographUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'tachographNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'tachographExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'tachographCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'driving_license', label: 'Driving Licence (UK/EU)', details: [
    { type: 'file', name: 'drivingLicenceUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'drivingLicenceNumber', label: 'Licence Number', required: true },
    { type: 'date', name: 'drivingLicenceExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'drivingLicenceCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'armed_forces_id', label: 'UK Armed Forces ID Card', details: [
    { type: 'file', name: 'forcesIdUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'forcesIdNumber', label: 'ID Card Number', required: true },
    { type: 'date', name: 'forcesIdExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'forcesIdCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'veteran_card', label: 'Veteran Card', details: [
    { type: 'file', name: 'veteranCardUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'veteranCardNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'veteranCardExpiry', label: 'Expiry Date', required: false },
    { type: 'select', name: 'veteranCardCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'frontier_permit', label: 'Frontier Worker Permit', details: [
    { type: 'file', name: 'frontierPermitUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'frontierPermitNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'frontierPermitExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'frontierPermitCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'work_permit_photo', label: 'Photographic Work Permit', details: [
    { type: 'file', name: 'workPermitUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'workPermitNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'workPermitExpiry', label: 'Expiry Date', required: false },
    { type: 'select', name: 'workPermitCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'immigration_doc', label: 'Photographic Immigration Doc', details: [
    { type: 'file', name: 'immigrationDocUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'immigrationDocNumber', label: 'Document Number', required: true },
    { type: 'date', name: 'immigrationDocExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'immigrationDocCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'visa_photo', label: 'Photographic Visa', details: [
    { type: 'file', name: 'visaPhotoUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'visaPhotoNumber', label: 'Visa Number', required: true },
    { type: 'date', name: 'visaPhotoExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'visaPhotoCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'firearms', label: 'Firearms License', details: [
    { type: 'file', name: 'firearmsUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'firearmsNumber', label: 'License Number', required: true },
    { type: 'date', name: 'firearmsExpiry', label: 'Expiry Date', required: true },
    { type: 'select', name: 'firearmsCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'prado', label: 'Photographic ID (PRADO)', details: [
    { type: 'file', name: 'pradoIdUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'pradoIdNumber', label: 'ID Number (if available)', required: false },
    { type: 'date', name: 'pradoIdExpiry', label: 'Expiry Date (if applicable)', required: false },
    { type: 'select', name: 'pradoIdCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
];

const groupBDocuments = [
  { id: 'birth_cert', label: 'Birth/Adoption Certificate', details: [
    { type: 'file', name: 'birthCertUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'utility_bill', label: 'Utility Bill', details: [
    { type: 'file', name: 'utilityBillUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'bank_statement', label: 'Bank Statement', details: [
    { type: 'file', name: 'bankStatementUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'marrigate_certificate', label: 'Marriage Certificate', details: [
    { type: 'file', name: 'marriageCertUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'immigration_document', label: 'Immigration Document', details: [
    { type: 'file', name: 'immigrationDocUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'nonPhotographic_visa', label: 'Non-photographic Visa', details: [
    { type: 'file', name: 'nonPhotoVisaUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'nonPhotographic_workPermit', label: 'Non-photographic Work Permit', details: [
    { type: 'file', name: 'nonPhotoWorkPermitUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'rental_agreement', label: 'Rental Agreement', details: [
    { type: 'file', name: 'rentalAgreementUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'tax_statement', label: 'Council Tax Statement', details: [
    { type: 'file', name: 'councilTaxUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
];

export function createDocumentDetailsSection(userId) {
  const section = document.createElement('div');
  section.classList.add('document-details-section');

  section.innerHTML = `
    <h3>Step 2: Identity Documents</h3>
    <span style="color:#b00;font-weight:500;">Note: You need to submit at least 1 document from Group A.</span>
    <div style="margin:1em 0;"><b>Documents selected: <span id="docCount-${userId}">0</span> of 2</b></div>
    <fieldset style="margin-bottom:2em;width:100%;box-sizing:border-box;padding:1.5em 1.5em 1em 1.5em;border:2px solid #ccc;">
      <legend>Group A Documents</legend>
      <div class="dropdown-container" style="width:100%;box-sizing:border-box;">
        <button type="button" id="toggle-groupA-${userId}" class="dropdown-btn" style="margin-bottom:0.5em;width:100%;text-align:left; border:1px solid #ddd; background:#fff;display:flex;align-items:center;justify-content:space-between;">
          <span id="groupA-label-text-${userId}" style="color:#000;">Select (maximum two) documents</span>
          <span style="color:#2a2a2a;font-size:1.2em;">▼</span>
        </button>
        <div class="dropdown-content" id="groupA-dropdown-${userId}" style="display:none;background:#fff;padding:1em 0;border-radius:6px;width:100%;box-sizing:border-box;">
          <div class="checkbox-grid" id="groupA-checkboxes-${userId}" style="display:grid;grid-template-columns:repeat(3,minmax(140px,1fr));gap:0.3em;">
            ${groupADocuments.map(doc => `
              <label style="display:block;margin-bottom:0.5em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                <input type="checkbox" class="groupA-checkbox" data-docid="${doc.id}" data-group="A" id="${doc.id}-checkbox-${userId}" value="${doc.id}" /> ${doc.label}
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <div id="groupA-details-container-${userId}"></div>
    </fieldset>
    <fieldset style="margin-bottom:2em;width:100%;box-sizing:border-box;padding:1.5em 1.5em 1em 1.5em;border:2px solid #ccc;">
      <legend>Group B Documents</legend>
      <div class="dropdown-container" style="width:100%;box-sizing:border-box;">
        <button type="button" id="toggle-groupB-${userId}" class="dropdown-btn" style="margin-bottom:0.5em;width:100%;text-align:left; border:1px solid #ddd; background:#fff;display:flex;align-items:center;justify-content:space-between;">
          <span id="groupB-label-text-${userId}" style="color:#000;">Select (any one) document</span>
          <span style="color:#2a2a2a;font-size:1.2em;">▼</span>
        </button>
        <div class="dropdown-content" id="groupB-dropdown-${userId}" style="display:none;background:#fff;padding:1em 0;border-radius:6px;width:100%;box-sizing:border-box;">
          <div class="checkbox-grid" id="groupB-checkboxes-${userId}" style="display:grid;grid-template-columns:repeat(3,minmax(140px,1fr));gap:0.3em;">
            ${groupBDocuments.map(doc => `
              <label style="display:block;margin-bottom:0.5em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                <input type="checkbox" class="groupB-checkbox" data-docid="${doc.id}" data-group="B" id="${doc.id}-checkbox-${userId}" value="${doc.id}" /> ${doc.label}
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <div id="groupB-details-container-${userId}"></div>
    </fieldset>
    <div style="margin-bottom:1em;">
      <input type="checkbox" id="confirmDocs-${userId}" /> I confirm that the above information is true and I will provide the documents as requested.
    </div>
  `;

  // --- Dropdown toggle logic ---
  const groupABtn = section.querySelector(`#toggle-groupA-${userId}`);
  const groupADropdown = section.querySelector(`#groupA-dropdown-${userId}`);
  groupABtn.addEventListener('click', () => {
    groupADropdown.style.display = groupADropdown.style.display === 'none' ? 'block' : 'none';
  });

  const groupBBtn = section.querySelector(`#toggle-groupB-${userId}`);
  const groupBDropdown = section.querySelector(`#groupB-dropdown-${userId}`);
  const groupBFieldset = section.querySelector('fieldset:nth-of-type(2)'); // Group B fieldset
  
  groupBBtn.addEventListener('click', () => {
    groupBDropdown.style.display = groupBDropdown.style.display === 'none' ? 'block' : 'none';
  });

  // --- Selection logic and label update logic ---
  const maxTotal = 2;
  const maxA = 2;
  const maxB = 1;

  const groupACheckboxes = section.querySelectorAll('.groupA-checkbox');
  const groupBCheckboxes = section.querySelectorAll('.groupB-checkbox');
  const groupALabelText = section.querySelector(`#groupA-label-text-${userId}`);
  const groupBLabelText = section.querySelector(`#groupB-label-text-${userId}`);
  const docCountSpan = section.querySelector(`#docCount-${userId}`);
  const groupADetailsContainer = section.querySelector(`#groupA-details-container-${userId}`);
  const groupBDetailsContainer = section.querySelector(`#groupB-details-container-${userId}`);

  async function loadCountriesForSelect(selectElement) {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca3");
      const countries = await response.json();

      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

      selectElement.innerHTML = '<option value="">Select Country</option>';

      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.cca3;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
      });

    } catch (error) {
      console.error("Failed to load country list:", error);
      selectElement.innerHTML = '<option value="">Unable to load countries</option>';
    }
  }

  function renderDocumentDetails(doc, group, userId) {
    const detailsId = `${doc.id}-details-fieldset-${userId}`;
    const fieldset = document.createElement('fieldset');
    fieldset.id = detailsId;
    fieldset.style.margin = '1.5em 0 2em 0';
    fieldset.style.padding = '1.2em 1.2em 1em 1.2em';
    fieldset.style.boxSizing = 'border-box';
    fieldset.style.border = '1px solid #ccc';
    const legend = document.createElement('legend');
    legend.textContent = doc.label + ' Details';
    legend.style.fontSize = '1.1em';
    legend.style.fontWeight = 'bold';
    legend.style.marginBottom = '0.7em';
    fieldset.appendChild(legend);
    
    doc.details.forEach(field => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '0.5em';
      label.textContent = field.label + ': ';
      
      if (field.type === 'file') {
        // Create container for file input and pill
        const fileContainer = document.createElement('div');
        fileContainer.style.display = 'flex';
        fileContainer.style.alignItems = 'center';
        fileContainer.style.gap = '10px';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = field.accept;
        input.required = field.required;
        input.name = `${field.name}-${userId}`;
        input.id = `${field.name}-${userId}`;
        input.style.flex = '1';

        // Pill for file name and clear button
        const pill = document.createElement('span');
        pill.style.display = 'none';
        pill.style.alignItems = 'center';
        pill.style.border = '1px solid #bbb';
        pill.style.borderRadius = '20px';
        pill.style.padding = '2px 12px 2px 10px';
        pill.style.background = '#fff';
        pill.style.marginLeft = '0.5em';
        pill.style.fontSize = '1em';
        pill.style.height = '30px';

        // File name span
        const fileNameSpan = document.createElement('span');
        fileNameSpan.style.marginRight = '8px';

        // Cross button
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.innerHTML = '✕';
        clearBtn.title = 'Clear file selection';
        clearBtn.style.background = 'none';
        clearBtn.style.color = '#b00';
        clearBtn.style.border = 'none';
        clearBtn.style.fontSize = '1.1em';
        clearBtn.style.cursor = 'pointer';
        clearBtn.style.marginLeft = '2px';
        clearBtn.style.padding = '0';
        clearBtn.style.height = '100%';
        clearBtn.style.display = 'inline-flex';
        clearBtn.style.alignItems = 'center';

        // Clear file selection functionality
        clearBtn.addEventListener('click', () => {
          input.value = '';
          pill.style.display = 'none';
        });

        // Show pill with file name when a file is selected
        input.addEventListener('change', () => {
          if (input.files && input.files.length > 0) {
            fileNameSpan.textContent = input.files[0].name;
            pill.style.display = 'inline-flex';
          } else {
            pill.style.display = 'none';
          }
        });

        pill.appendChild(fileNameSpan);
        pill.appendChild(clearBtn);

        fileContainer.appendChild(input);
        fileContainer.appendChild(pill);
        label.appendChild(fileContainer);
      } else {
        let input;
        
        if (field.type === 'select') {
          input = document.createElement('select');
          input.required = field.required;
          input.name = `${field.name}-${userId}`;
          input.id = `${field.name}-${userId}`;
          
          // If it's a country field, populate with countries
          if (field.isCountry) {
            loadCountriesForSelect(input);
          }
        } else {
          input = document.createElement('input');
          input.type = field.type;
          input.required = field.required;
          input.name = `${field.name}-${userId}`;
          input.id = `${field.name}-${userId}`;
        }
        
        label.appendChild(input);
      }
      
      fieldset.appendChild(label);
    });
    return fieldset;
  }

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
        <span class="doc-pill" data-doc="${docValue}" style="display:inline-block;background:#fff;border-radius:8px;padding:4px 12px;margin-right:4px;cursor:pointer;">
          ${docName} <span class="doc-remove" data-doc="${docValue}" title="Remove" style="color:#b00;font-weight:bold;margin-left:4px;">✕</span>
        </span>
      `;
    }).join('');
    // Add remove logic for pills
    labelElement.querySelectorAll('.doc-remove').forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        const docValue = span.getAttribute('data-doc');
        const cb = section.querySelector(`input[value="${docValue}"][data-group="${checkboxes[0].classList.contains('groupA-checkbox') ? 'A' : 'B'}"]`);
        if (cb) {
          cb.checked = false;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  function updateDocCountDisplay() {
    const count = section.querySelectorAll('.groupA-checkbox:checked, .groupB-checkbox:checked').length;
    docCountSpan.textContent = count;
  }

  function updateDocSelection(e) {
    const aCount = Array.from(groupACheckboxes).filter(cb => cb.checked).length;
    const bCount = Array.from(groupBCheckboxes).filter(cb => cb.checked).length;
    const total = aCount + bCount;

    if (bCount > maxB) {
      alert("❌ You can select only ONE document from Group B.");
      e.target.checked = false;
      return;
    }
    if (total > maxTotal) {
      alert("❌ You can only select a total of TWO documents from Group A and B combined.");
      e.target.checked = false;
      return;
    }
    
    // Hide/show Group B fieldset based on Group A selection
    const groupBFieldset = section.querySelector('fieldset:nth-of-type(2)'); // Group B fieldset
    if (groupBFieldset) {
      if (aCount >= maxA) {
        // Hide Group B fieldset when max Group A documents are selected
        groupBFieldset.style.display = 'none';
        
        // Uncheck any Group B checkboxes and clear their details
        groupBCheckboxes.forEach(cb => {
          if (cb.checked) {
            cb.checked = false;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        groupBDetailsContainer.innerHTML = '';
        updateDropdownLabel(groupBCheckboxes, groupBLabelText, 'Select (any one) document');
      } else {
        // Show Group B fieldset when fewer than max Group A documents are selected
        groupBFieldset.style.display = 'block';
      }
    }
    
    // Disable further selection if limit reached
    const disable = total >= maxTotal;
    groupACheckboxes.forEach(cb => cb.disabled = !cb.checked && disable);
    groupBCheckboxes.forEach(cb => cb.disabled = !cb.checked && (disable || bCount >= maxB));
    updateDocCountDisplay();

    // Show/hide document details fieldsets
    // Group A
    groupADetailsContainer.innerHTML = '';
    groupADocuments.forEach(doc => {
      const cb = section.querySelector(`#${doc.id}-checkbox-${userId}`);
      if (cb && cb.checked) {
        groupADetailsContainer.appendChild(renderDocumentDetails(doc, 'A', userId));
      }
    });
    // Group B
    groupBDetailsContainer.innerHTML = '';
    groupBDocuments.forEach(doc => {
      const cb = section.querySelector(`#${doc.id}-checkbox-${userId}`);
      if (cb && cb.checked) {
        groupBDetailsContainer.appendChild(renderDocumentDetails(doc, 'B', userId));
      }
    });
  }

  groupACheckboxes.forEach(cb => {
    cb.addEventListener('change', function (e) {
      updateDropdownLabel(groupACheckboxes, groupALabelText, 'Select (maximum two) documents');
      updateDocSelection(e);
    });
  });
  groupBCheckboxes.forEach(cb => {
    cb.addEventListener('change', function (e) {
      updateDropdownLabel(groupBCheckboxes, groupBLabelText, 'Select (any one) document');
      updateDocSelection(e);
    });
  });

  // Initial label and count
  updateDropdownLabel(groupACheckboxes, groupALabelText, 'Select (maximum two) documents');
  updateDropdownLabel(groupBCheckboxes, groupBLabelText, 'Select (any one) document');
  updateDocCountDisplay();

  return section;
} 