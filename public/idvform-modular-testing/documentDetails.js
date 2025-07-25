// documentDetails.js
import { uploadAndExtract, uploadedFilesCache } from "../js/helpers/uploadAndExract.js";
import { proxyToBackend } from './collectAndSendFormData.js';
import { loadCountries } from '../js/helpers/loadCountries.js';
// Full Group A and Group B document lists from idvform-ocr.html
export const groupADocuments = [
  { id: 'passport', label: 'Passport', details: [
    { type: 'file', name: 'passportUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'passportNumber', label: 'Passport Number', required: true },
    { type: 'date', name: 'passportExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'passportCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'driving_license', label: 'Driving Licence (UK/EU)', details: [
    { type: 'file', name: 'driving_licenseUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'driving_licenseNumber', label: 'Licence Number', required: true },
    { type: 'date', name: 'driving_licenseExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'driving_licenseCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'irish_passport', label: 'Irish Passport Card', details: [
    { type: 'file', name: 'irish_passportUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'irish_passportNumber', label: 'Passport Card Number', required: true },
    { type: 'date', name: 'irish_passportExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'irish_passportCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'biometric_id', label: 'EU Biometric ID Card', details: [
    { type: 'file', name: 'biometric_idUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'biometric_idNumber', label: 'ID Number', required: true },
    { type: 'date', name: 'biometric_idExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'biometric_idCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'brp', label: 'UK Biometric Residence Permit', details: [
    { type: 'file', name: 'brpUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'brpNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'brpExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'brpCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'brc', label: 'UK Biometric Residence Card', details: [
    { type: 'file', name: 'brcUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'brcNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'brcExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'brcCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'pass_card', label: 'UK Accredited PASS Card', details: [
    { type: 'file', name: 'pass_cardUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'pass_cardNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'pass_cardExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: false },
    { type: 'select', name: 'pass_cardCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'tachograph', label: 'UK/EU Tachograph Card', details: [
    { type: 'file', name: 'tachographUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'tachographNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'tachographExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'tachographCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'armed_forces_id', label: 'UK Armed Forces ID Card', details: [
    { type: 'file', name: 'armed_forces_idUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'armed_forces_idNumber', label: 'ID Card Number', required: true },
    { type: 'date', name: 'armed_forces_idExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'armed_forces_idCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'veteran_card', label: 'Veteran Card', details: [
    { type: 'file', name: 'veteran_cardUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'veteran_cardNumber', label: 'Card Number', required: true },
    { type: 'date', name: 'veteran_cardExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: false },
    { type: 'select', name: 'veteran_cardCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'frontier_permit', label: 'Frontier Worker Permit', details: [
    { type: 'file', name: 'frontier_permitUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'frontier_permitNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'frontier_permitExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'frontier_permitCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'work_permit_photo', label: 'Photographic Work Permit', details: [
    { type: 'file', name: 'work_permit_photoUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'work_permit_photoNumber', label: 'Permit Number', required: true },
    { type: 'date', name: 'work_permit_photoExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: false },
    { type: 'select', name: 'work_permit_photoCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'immigration_doc', label: 'Photographic Immigration Doc', details: [
    { type: 'file', name: 'immigration_docUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'immigration_docNumber', label: 'Document Number', required: true },
    { type: 'date', name: 'immigration_docExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'immigration_docCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'visa_photo', label: 'Photographic Visa', details: [
    { type: 'file', name: 'visa_photoUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'visa_photoNumber', label: 'Visa Number', required: true },
    { type: 'date', name: 'visa_photoExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'visa_photoCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'firearms', label: 'Firearms License', details: [
    { type: 'file', name: 'firearmsUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'firearmsNumber', label: 'License Number', required: true },
    { type: 'date', name: 'firearmsExpiry', label: 'Expiry Date', placeholderText: 'Select date (dd/mm/yyyy)', required: true },
    { type: 'select', name: 'firearmsCountry', label: 'Country of Issue', required: true, isCountry: true }
  ] },
  { id: 'prado', label: 'Photographic ID (PRADO)', details: [
    { type: 'file', name: 'pradoUpload', label: 'Upload Document', required: true, accept: '.jpg,.jpeg,.png,.pdf' },
    { type: 'text', name: 'pradoNumber', label: 'ID Number (if available)', required: false },
    { type: 'date', name: 'pradoExpiry', label: 'Expiry Date (if applicable)', placeholderText: 'Select date (dd/mm/yyyy)', required: false },
    { type: 'select', name: 'pradoCountry', label: 'Country of Issue', required: true, isCountry: true }
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
  { id: 'marriage_certificate', label: 'Marriage Certificate', details: [
    { type: 'file', name: 'marriageCertUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'immigration_document', label: 'Immigration Document', details: [
    { type: 'file', name: 'immigrationDocUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'non_photographic_visa', label: 'Non-photographic Visa', details: [
    { type: 'file', name: 'nonPhotoVisaUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'non_photographic_work_permit', label: 'Non-photographic Work Permit', details: [
    { type: 'file', name: 'nonPhotoWorkPermitUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'rental_agreement', label: 'Rental Agreement', details: [
    { type: 'file', name: 'rentalAgreementUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
  { id: 'tax_statement', label: 'Council Tax Statement', details: [
    { type: 'file', name: 'councilTaxUpload', label: 'Upload Document', required: true, accept: '.pdf,.jpg,.jpeg,.png' }
  ] },
];


// Add this at the top of the file, outside the function
const documentInputState = {};
// Cache for file input DOM nodes and previews
const fileInputDOMCache = new Map(); // Will now use `${doc.id}-${userId}` as key

// Helper for expiry date validation (modular)
function getExpiryValidationRule(fieldName) {
  if (fieldName.startsWith('passportExpiry') || fieldName.startsWith('driving_licenseExpiry')) {
    return function(selectedDate, today) {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      if (selectedDate < sixMonthsAgo) {
        return {
          valid: false,
          message: 'Expiry date cannot be more than 6 months in the past.'
        };
      }
      return { valid: true };
    };
  }
  return function() { return { valid: true }; };
}

// Robust date parser for OCR/user input
function parseDateFlexible(value) {
  if (!value) return new Date('invalid');
  // Try ISO (yyyy-mm-dd)
  let d = new Date(value);
  if (!isNaN(d)) return d;
  // Try dd/mm/yyyy or dd-mm-yyyy
  const dmY = /^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})$/;
  let m = value.match(dmY);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  // Try yyyymmdd
  const ymd = /^(\d{4})(\d{2})(\d{2})$/;
  m = value.match(ymd);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}`);
  // Try d M Y (flatpickr)
  const dMY = /^([0-3]?\d) (\w{3}) (\d{4})$/;
  m = value.match(dMY);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  // Fallback: invalid
  return new Date('invalid');
}

function validateExpiryDate(input, errorContainer) {
  const value = input.value;
  errorContainer.textContent = '';
  input.classList.remove('invalid-expiry');
  if (!value) return true;
  const selectedDate = parseDateFlexible(value);
  const today = new Date();
  today.setHours(0,0,0,0);
  // Get the rule for this field
  const rule = getExpiryValidationRule(input.name);
  const result = rule(selectedDate, today);
  if (!result.valid) {
    errorContainer.textContent = result.message || 'Invalid expiry date.';
    input.classList.add('invalid-expiry');
    return false;
  }
  return true;
}


export function createDocumentDetailsSection(userId, displayName) {
  const section = document.createElement('div');
  section.classList.add('document-details-section');

  section.innerHTML = `
    <h3>Identity Documents - ${displayName}</h3>
    <span style="color:#b00;font-weight:500;">Note: You need to submit at least 1 document from Group A.</span>
    <div style="margin:1em 0;"><b>Documents selected: <span id="docCount-${userId}">0</span> of 2</b></div>
    <fieldset style="margin-bottom:2em;width:100%;box-sizing:border-box;padding:1.5em 1.5em 1em 1.5em;border:2px solid #ccc;">
      <legend>Group A Documents</legend>
      <div style="margin-bottom:1em; color:#012169; font-weight:500; background:#f5f7fa; border-radius:6px; padding:0.7em 1em;">A face verification link will be sent via email in order to verify the identity of the individual.</div>
      <div class="dropdown-container" style="width:100%;box-sizing:border-box;">
        <button type="button" id="toggle-groupA-${userId}" class="dropdown-btn" style="margin-bottom:0.5em;width:100%;text-align:left; border:1px solid #ddd; background:#fff;display:flex;align-items:center;justify-content:space-between;">
          <span id="groupA-label-text-${userId}" style="color:#000;">Select (maximum two) documents</span>
          <span style="color:#2a2a2a;font-size:1.2em;">🔻</span>
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
      <div id="groupA-details-container-${userId}" class="groupA-details-container"></div>
    </fieldset>
    <fieldset style="margin-bottom:2em;width:100%;box-sizing:border-box;padding:1.5em 1.5em 1em 1.5em;border:2px solid #ccc;">
      <legend>Group B Documents</legend>
      <div class="dropdown-container" style="width:100%;box-sizing:border-box;">
        <button type="button" id="toggle-groupB-${userId}" class="dropdown-btn" style="margin-bottom:0.5em;width:100%;text-align:left; border:1px solid #ddd; background:#fff;display:flex;align-items:center;justify-content:space-between;">
          <span id="groupB-label-text-${userId}" style="color:#000;">Select (any one) document</span>
          <span style="color:#2a2a2a;font-size:1.2em;">🔻</span>
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
      <label style="cursor:pointer; font-weight:normal; font-size:14px;">
        <input type="checkbox" id="confirmDocs-${userId}" />
        I confirm that all information and documents provided, including those for any additional individuals, are true, complete, and accurate to the best of my knowledge. I understand that providing false or misleading information may have legal consequences and affect this application.
      </label>
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
  groupADetailsContainer.classList.add('groupA-details-container');
  const groupBDetailsContainer = section.querySelector(`#groupB-details-container-${userId}`);

  async function loadCountriesForSelect(selectElement, selectedValue) {
    try {
      const countries = await loadCountries();
      selectElement.innerHTML = '<option value="">Select Country</option>';
      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.cca3;
        option.textContent = country.name.common;
        selectElement.appendChild(option);
      });
      // Set the selected value after options are loaded
      if (selectedValue) {
        selectElement.value = selectedValue;
      }
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
    legend.style.fontWeight = 'normal';
    legend.style.marginBottom = '0.7em';
    fieldset.appendChild(legend);
    
    doc.details.forEach(field => {
      const label = document.createElement('label');
      label.style.fontWeight = 'normal';
      label.style.display = 'flex';
      label.style.flexDirection = 'column';
      label.style.gap = '10px';
      label.style.marginBottom = '1.2em';
      label.textContent = field.label + ': ';
      let input;
      
      if (field.type === 'file') {
        // --- Begin file input cache logic ---
        let cached = fileInputDOMCache.get(`${doc.id}-${userId}`);
        if (cached && cached.input && cached.label) {
          // Reuse cached DOM nodes
          fieldset.appendChild(cached.label);
          return;
        }
        input = document.createElement('input');
        input.type = 'file';
        input.accept = field.accept;
        input.required = field.required;
        input.name = `${field.name}-${userId}`;
        input.id = `${field.name}-${userId}`;
        
        // Add cross button to clear file input
        const clearBtn = document.createElement('span');
        clearBtn.textContent = '✕';
        clearBtn.title = 'Clear selection';
        clearBtn.style.cursor = 'pointer';
        clearBtn.style.marginLeft = '8px';
        clearBtn.style.color = '#b00';
        clearBtn.style.fontWeight = 'bold';
        clearBtn.style.fontSize = '1.2em';
        clearBtn.style.verticalAlign = 'middle';
        clearBtn.style.display = 'none';
        
        // --- Image preview element ---
        const imagePreview = document.createElement('img');
        imagePreview.style.display = 'none';
        imagePreview.style.maxWidth = '250px';
        imagePreview.style.marginTop = '8px';
        imagePreview.style.border = '1px solid #ccc';
        imagePreview.style.borderRadius = '4px';
        
        // Show/hide cross and preview depending on file selection
        input.addEventListener('change', () => {
          clearBtn.style.display = input.files && input.files.length > 0 ? 'inline' : 'none';

          // Image preview logic
          const file = input.files && input.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
              imagePreview.src = e.target.result;
              imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
          } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
          }
        });
        // Clear file input on cross click
        clearBtn.addEventListener('click', (e) => {
          e.preventDefault();
          input.value = '';
          clearBtn.style.display = 'none';
          imagePreview.src = '';
          imagePreview.style.display = 'none';
          input.dispatchEvent(new Event('change', { bubbles: true }));

          // Uncheck the corresponding Group A checkbox and trigger its change event
          if (group === 'A') {
            const groupACheckbox = section.querySelector(`#${doc.id}-checkbox-${userId}`);
            if (groupACheckbox && groupACheckbox.checked) {
              groupACheckbox.checked = false;
              groupACheckbox.dispatchEvent(new Event('change', { bubbles: true }));
              // Force updateDocSelection to run immediately
              updateDocSelection({ target: groupACheckbox });
            }
          }
        });

        // --- Passport upload: trigger uploadAndExtract and show loading indicator ---
        if (field.name === 'passportUpload') {
          const loadingText = document.createElement('span');
          loadingText.textContent = 'Please hold on as we extract the details for you';
          loadingText.className = 'ocr-loading-text';
          loadingText.style.color = '#0074d9';
          loadingText.style.fontSize = '0.95em';
          loadingText.style.display = 'none';
          label.appendChild(input);
          label.appendChild(clearBtn);
          label.appendChild(imagePreview);
          label.appendChild(loadingText);
          fieldset.appendChild(label);
          input.addEventListener('change', async (e) => {
            if (input.files && input.files[0]) {
              // Always reset the loading message and style on every upload
              loadingText.textContent = 'Please hold on as we extract the details for you';
              loadingText.style.color = '#0074d9';
              loadingText.style.display = 'inline';
              // Clear the cache for this user when a new file is selected
              const cacheKey = `passport-${userId}`;
              uploadedFilesCache.delete(cacheKey);
              
              try {
                await uploadAndExtract(input.files[0], userId, loadingText);
              } finally {
                // If error, keep visible for 5 seconds, then hide; else hide immediately
                if (loadingText.textContent.startsWith('❌')) {
                  setTimeout(() => {
                    loadingText.style.display = 'none';
                  }, 5000);
                } else {
                  loadingText.style.display = 'none';
                }
              }
            } else {
              // If no file is selected, hide the loadingText
              loadingText.style.display = 'none';
            }
          });
          // Cache the DOM nodes
          fileInputDOMCache.set(`${doc.id}-${userId}`, { input, label });
          return;
        }
        // --- End passport upload logic ---

        label.appendChild(input);
        label.appendChild(clearBtn);
        label.appendChild(imagePreview);
        fieldset.appendChild(label);
        // Cache the DOM nodes
        fileInputDOMCache.set(`${doc.id}-${userId}`, { input, label });
        return;
      } else if (field.type === 'select') {
        input = document.createElement('select');
        input.required = field.required;
        input.name = `${field.name}-${userId}`;
        input.id = `${field.name}-${userId}`;
        // If it's a country field, populate with countries and restore value if present
        if (field.isCountry) {
          let selectedValue = undefined;
          if (
            documentInputState[doc.id] &&
            documentInputState[doc.id][field.name]
          ) {
            selectedValue = documentInputState[doc.id][field.name];
          } else if (doc.label === 'Irish Passport Card') {
            // Ireland CCA3 code is 'IRL'
            selectedValue = 'IRL';
          } else if (doc.label.includes('UK')) {
            // United Kingdom CCA3 code is 'GBR'
            selectedValue = 'GBR';
          }
          loadCountriesForSelect(input, selectedValue);
        }
      } 
      
      else {
        input = document.createElement('input');
      // Always use text for flatpickr/date fields
      input.type = (field.type === 'date') ? 'text' : field.type;
      input.required = field.required;
      input.name = `${field.name}-${userId}`;
      input.id = `${field.name}-${userId}`;
      // 👇 Set placeholder if available
      if (field.placeholderText) input.placeholder = field.placeholderText;
      // Add expiry validation if this is an expiry date field
      if (field.name.toLowerCase().includes('expiry')) {
        input.classList.add('expiry-date-input');
        const today = new Date();
        today.setHours(0,0,0,0);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'expiry-error';
        errorContainer.style.color = '#b00';
        errorContainer.style.fontSize = '0.95em';
        errorContainer.style.marginTop = '2px';
        function validateAndShowExpiry() {
          const valid = validateExpiryDate(input, errorContainer);
          if (!valid) {
            input.setCustomValidity(errorContainer.textContent || 'Invalid expiry date.');
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            input.setCustomValidity('');
          }
        }
        input.addEventListener('input', validateAndShowExpiry);
        input.addEventListener('change', validateAndShowExpiry);
        setTimeout(() => {
          if (input.value) validateAndShowExpiry();
        }, 0);
        flatpickr(input, {
          dateFormat: "d M Y",
          allowInput: true,
          onClose: function(selectedDates, dateStr, instance) {
            validateAndShowExpiry();
          }
        });
        label.appendChild(input);
        label.appendChild(errorContainer);
        fieldset.appendChild(label);
        return;
      }
      // Otherwise, nothing special for plain text fields etc.
    }
    
    label.appendChild(input);
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
    if (groupBFieldset) {
      if (aCount < maxA) {
        groupBFieldset.style.display = '';
      } else {
        groupBFieldset.style.display = 'none';
        groupBCheckboxes.forEach(cb => {
          if (cb.checked) {
            cb.checked = false;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        groupBDetailsContainer.innerHTML = '';
        updateDropdownLabel(groupBCheckboxes, groupBLabelText, 'Select (any one) document');
      }
    }

    // Disable further selection if limit reached
    const disable = total >= maxTotal;
    groupACheckboxes.forEach(cb => cb.disabled = !cb.checked && disable);
    groupBCheckboxes.forEach(cb => cb.disabled = !cb.checked && (disable || bCount >= maxB));
    updateDocCountDisplay();

    // --- Save current input values from DOM before clearing ---
    groupADocuments.forEach(doc => {
      const fieldset = groupADetailsContainer.querySelector(`#${doc.id}-details-${userId}`);
      if (fieldset) {
        documentInputState[doc.id] = {};
        doc.details.forEach(field => {
          const input = fieldset.querySelector(`[name='${field.name}-${userId}']`);
          if (input) {
            if (input.type === 'file') {
              documentInputState[doc.id][field.name] = null;
              // Remove file input cache if document is being deselected
              const cb = section.querySelector(`#${doc.id}-checkbox-${userId}`);
              if (!cb || !cb.checked) {
                fileInputDOMCache.delete(`${doc.id}-${userId}`);
              }
            } else {
              documentInputState[doc.id][field.name] = input.value;
            }
          }
        });
      }
    });

    // Show/hide document details fieldsets
    // Group A
    groupADetailsContainer.innerHTML = '';
    groupADocuments.forEach(doc => {
      const cb = section.querySelector(`#${doc.id}-checkbox-${userId}`);
      if (cb && cb.checked) {
        const fieldset = renderDocumentDetails(doc, 'A', userId);
        fieldset.id = `${doc.id}-details-${userId}`;
        groupADetailsContainer.appendChild(fieldset);
        // Restore values if present
        if (documentInputState[doc.id]) {
          doc.details.forEach(field => {
            const input = fieldset.querySelector(`[name='${field.name}-${userId}']`);
            if (input && documentInputState[doc.id][field.name] !== undefined) {
              if (input.type === 'file') {
                // Cannot restore file input for security reasons
              } else {
                input.value = documentInputState[doc.id][field.name];
              }
            }
          });
        }
      }
    });

    // Add or remove 'two-docs' class for two-column layout
    const details = groupADetailsContainer.querySelectorAll('.document-details');
    if (details.length === 2) {
      groupADetailsContainer.classList.add('two-docs');
    } else {
      groupADetailsContainer.classList.remove('two-docs');
    }

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
// Returns true if at least TWO Group A or B documents are selected for a given user
export function hasAtLeastTwoDocumentsSelected(userId) {
  const section = document.querySelector(`#userSection-${userId} .document-details-section`);
  if (!section) return false;
  // Count all checked checkboxes (regardless of group)
  const checked = section.querySelectorAll('input[type="checkbox"]:checked');
  return checked.length >= 2;
}
