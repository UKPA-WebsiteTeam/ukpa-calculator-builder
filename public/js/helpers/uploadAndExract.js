import { proxyToBackend } from '../../idvform-modular-testing/collectAndSendFormData.js';
// Global storage for uploaded files to prevent duplicate uploads
const uploadedFilesCache = new Map();

export async function uploadAndExtract(file, userId, loadingText) {
  const filerEmail = document.getElementById('filerEmail')?.value || '';
  const filerFullName = document.getElementById('filerFullName')?.value || '';
  const userFirstName = document.getElementById(`firstName-${userId}`)?.value || '';
  const userLastName = document.getElementById(`lastName-${userId}`)?.value || '';

  // Prepare FormData for proxy
  const formData = new FormData();
  formData.append('action', 'ukpa_idv_proxy');
  formData.append('endpoint', 'ocrExtract');
  formData.append('doc', file); // the actual file
  formData.append('docType', 'passport');
  formData.append('filerEmail', filerEmail);
  formData.append('filerFullName', filerFullName);
  formData.append('userIndex', userId);
  formData.append('userFirstName', userFirstName);
  formData.append('userLastName', userLastName);
  formData.append('nonce', window.ukpa_idv_form_data.nonce);

  try {
    const res = await fetch(window.ukpa_idv_form_data.ajaxurl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const json = await res.json();
    console.log('OCR backend response:', json);
    let nodeResponse = json;
    if (json?.data?.body) {
      try {
        nodeResponse = JSON.parse(json.data.body);
      } catch (e) {
        console.error('Failed to parse backend body:', json.data.body);
        throw new Error('Invalid backend response');
      }
    }
    if (!nodeResponse.fields) {
      console.error('Unexpected OCR backend response:', json);
      throw new Error('No fields returned in response');
    }

    // Store the uploaded file information for reuse during form submission
    if (nodeResponse.driveFile) {
      const cacheKey = `passport-${userId}`;
      uploadedFilesCache.set(cacheKey, nodeResponse.driveFile);
    }

    setTimeout(() => {
      const fields = nodeResponse.fields;
      // Passport Number
      if (fields.passportNumber) {
        const el = document.querySelector(`input[name="passportNumber-${userId}"]`);
        if (el) { el.value = fields.passportNumber; console.log('Filled passportNumber:', fields.passportNumber); }
      }
      // Expiry
      if (fields.expiry) {
        const el = document.querySelector(`input[name="passportExpiry-${userId}"]`);
        if (el) { 
          // Format the date for flatpickr if needed
          let formattedDate = fields.expiry;
          // If the date is in ISO format (YYYY-MM-DD), convert to flatpickr format (d M Y)
          if (/^\d{4}-\d{2}-\d{2}$/.test(fields.expiry)) {
            const date = new Date(fields.expiry);
            if (!isNaN(date)) {
              const day = date.getDate();
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const year = date.getFullYear();
              formattedDate = `${day} ${month} ${year}`;
            }
          }
          el.value = formattedDate; 
          console.log('Filled expiry:', formattedDate);
          
          // Update flatpickr instance if it exists
          if (el._flatpickr) {
            el._flatpickr.setDate(formattedDate, false);
          }
          
          // Trigger validation after setting the value
          el.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Additional validation trigger with a small delay to ensure flatpickr is ready
          setTimeout(() => {
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }, 50);
        }
      }
      // Date of Birth
      if (fields.dob) {
        const el = document.querySelector(`input[name="passportDob-${userId}"]`);
        if (el) { el.value = fields.dob; console.log('Filled dob:', fields.dob); }
      }
      // Full Name
      if (fields.fullName) {
        const el = document.querySelector(`input[name="passportFullName-${userId}"]`);
        if (el) { el.value = fields.fullName; console.log('Filled fullName:', fields.fullName); }
      }
      // Surname
      if (fields.surname) {
        const el = document.querySelector(`input[name="passportSurname-${userId}"]`);
        if (el) { el.value = fields.surname; console.log('Filled surname:', fields.surname); }
      }
      // Given Names
      if (fields.givenNames) {
        const el = document.querySelector(`input[name="passportGivenNames-${userId}"]`);
        if (el) { el.value = fields.givenNames; console.log('Filled givenNames:', fields.givenNames); }
      }
      // Issue Date
      if (fields.issueDate) {
        const el = document.querySelector(`input[name="passportIssueDate-${userId}"]`);
        if (el) { el.value = fields.issueDate; console.log('Filled issueDate:', fields.issueDate); }
      }
      // Nationality
      if (fields.nationality) {
        const el = document.querySelector(`input[name="passportNationality-${userId}"]`);
        if (el) { el.value = fields.nationality; console.log('Filled nationality:', fields.nationality); }
      }
      // Sex
      if (fields.sex) {
        const el = document.querySelector(`input[name="passportSex-${userId}"]`);
        if (el) { el.value = fields.sex; console.log('Filled sex:', fields.sex); }
      }
      // Personal Number
      if (fields.personalNumber) {
        const el = document.querySelector(`input[name="passportPersonalNumber-${userId}"]`);
        if (el) { el.value = fields.personalNumber; console.log('Filled personalNumber:', fields.personalNumber); }
      }
      // Issuing Country (dropdown)
      if (fields.issuingCountry) {
        const countrySelect = document.querySelector(`select[name="passportCountry-${userId}"]`);
        if (countrySelect) {
          const matchedOption = Array.from(countrySelect.options).find(
            opt => opt.value.toLowerCase() === fields.issuingCountry.toLowerCase()
          );
          if (matchedOption) {
            countrySelect.value = matchedOption.value;
            console.log('Filled issuingCountry:', fields.issuingCountry);
          }
        }
      }
      console.log("All OCR values:", fields);
    }, 150);
  } catch (err) {
    // Show user-friendly error in the provided loadingText element if present
    if (loadingText) {
      loadingText.textContent = '❌ Extraction failed. Please check your document and try again. If the problem persists, please upload another image or mannualy input the values below';
      if (loadingText.style) {
        loadingText.style.color = '#b00';
        loadingText.style.display = 'inline';
      }
    }
    console.error("Upload error:", err);
  }
}

// Export the cache for use in other modules
export { uploadedFilesCache };