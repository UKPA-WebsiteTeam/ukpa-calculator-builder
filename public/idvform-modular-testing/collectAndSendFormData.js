import { setSubmitOverlayMessage } from './index.js';
import { uploadedFilesCache } from "../js/helpers/uploadAndExract.js";
import { groupADocuments } from './documentDetails.js'; // <-- Import groupADocuments for field mapping
// Remove dotenv import and config
// --- Helper to send requests via WP proxy ---
export async function proxyToBackend(endpoint, payload, method = 'POST') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(window.ukpa_idv_form_data.ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'ukpa_idv_proxy',
        nonce: window.ukpa_idv_form_data.nonce,
        endpoint, // e.g., 'ocrExtract', 'dataSubmit', etc.
        method,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload)
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    // Only throw if success is explicitly false (WordPress AJAX error)
    if (data.hasOwnProperty('success') && !data.success) throw new Error(data.message || 'Proxy error');
    // If the response is a direct backend response, return it
    if (data.body === undefined && data.status === undefined && typeof data === 'object') {
      return data;
    }
    // Otherwise, try to parse the body
    try {
      return JSON.parse(data.body);
    } catch {
      return data.body;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    } else if (err.message.includes('Failed to fetch') || err.message.includes('Couldn\'t connect')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and ensure the backend server is running.');
    }
    throw err;
  }
}

// --- Helper to upload a document once and reuse the Drive file link ---
async function uploadDocument(file, docType, userIndex) {
  const cacheKey = `${docType}-${userIndex}`;
  const cachedFile = uploadedFilesCache.get(cacheKey);
  if (cachedFile) {
    console.log(`Using cached upload for ${docType}-${userIndex}`);
    return cachedFile;
  }
  const formData = new FormData();
  formData.append('doc', file);
  formData.append('docType', docType);
  formData.append('userIndex', userIndex);
  formData.append('filerEmail', getValue('filerEmail'));
  formData.append('filerFullName', getValue('filerFullName'));
  formData.append('filerContactNumber', getValue('filerContactNumber'));
  formData.append('userFirstName', getValue(`firstName-${userIndex}`));
  formData.append('userLastName', getValue(`lastName-${userIndex}`));

  // Use the proxy directly for file upload (ocrExtract)
  const response = await fetch(window.ukpa_idv_form_data.ajaxurl, {
    method: 'POST',
    body: (() => {
      formData.append('action', 'ukpa_idv_proxy');
      formData.append('nonce', window.ukpa_idv_form_data.nonce);
      formData.append('endpoint', 'ocrExtract');
      return formData;
    })(),
    credentials: 'same-origin'
  });
  const data = await response.json();
  console.log('[uploadDocument] Raw proxy response:', data);
  let result;
  if (data.body) {
    try {
      result = JSON.parse(data.body);
    } catch {
      result = data.body;
    }
  } else if (data.data) {
    if (typeof data.data.body === 'string') {
      try {
        result = JSON.parse(data.data.body);
      } catch {
        result = data.data.body;
      }
    } else {
      result = data.data;
    }
  } else {
    result = data;
  }
  console.log('[uploadDocument] Parsed backend result:', result);
  if (!result || typeof result !== 'object') {
    alert('Upload failed: Unexpected server response.');
    return null;
  }
  if (result.success) {
    return {
      filePath: result.filePath,
      fileName: result.fileName,
      link: result.link,
      storageType: result.storageType,
      local: result.local
    };
  } else {
    alert('Upload failed: ' + (result.error || result.message));
    return null;
  }
}

const GROUP_A_INPUT_NAME_MAP = {
  passport: 'passportUpload',
  irish_passport: 'irish_passportUpload',
  biometric_id: 'biometric_idUpload',
  brp: 'brpUpload',
  brc: 'brcUpload',
  pass_card: 'pass_cardUpload',
  tachograph: 'tachographUpload',
  driving_license: 'driving_licenseUpload',
  armed_forces_id: 'armed_forces_idUpload',
  veteran_card: 'veteran_cardUpload',
  frontier_permit: 'frontier_permitUpload',
  work_permit_photo: 'work_permit_photoUpload',
  immigration_doc: 'immigration_docUpload',
  visa_photo: 'visa_photoUpload',
  firearms: 'firearmsUpload',
  prado: 'pradoUpload'
};



// ✅ Group B map: snake_case → camelCase input name
const GROUP_B_INPUT_NAME_MAP = {
  birth_cert: 'birthCertUpload',
  utility_bill: 'utilityBillUpload',
  bank_statement: 'bankStatementUpload',
  marriage_certificate: 'marriageCertUpload',
  immigration_document: 'immigrationDocUpload',
  non_photographic_visa: 'nonPhotoVisaUpload',
  non_photographic_work_permit: 'nonPhotoWorkPermitUpload',
  rental_agreement: 'rentalAgreementUpload',
  tax_statement: 'councilTaxUpload',
};

// --- Persist uploadedFilesCache in localStorage ---
function saveCacheToLocalStorage() {
  const obj = {};
  for (const [key, value] of uploadedFilesCache.entries()) {
    obj[key] = value;
  }
  localStorage.setItem('ukpa_uploadedFilesCache', JSON.stringify(obj));
}
function loadCacheFromLocalStorage() {
  const str = localStorage.getItem('ukpa_uploadedFilesCache');
  if (str) {
    try {
      const obj = JSON.parse(str);
      for (const key in obj) {
        uploadedFilesCache.set(key, obj[key]);
      }
    } catch (e) { /* ignore */ }
  }
}
// Restore cache on page load
loadCacheFromLocalStorage();

// --- Helper function to get payment status ---
export function getPaymentStatus() {
  // Check URL parameters for payment status
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const paymentStatus = urlParams.get('payment_status');
  
  // Check localStorage for payment status (might be set after Stripe redirect)
  const storedPaymentStatus = localStorage.getItem('ukpa_payment_status');
  
  // Priority: URL param > localStorage > default to pending
  if (paymentStatus) {
    // Payment status from URL (e.g., ?payment_status=success or ?payment_status=pending)
    const status = paymentStatus.toLowerCase() === 'success' ? 'success' : 'pending';
    // Store it for future reference
    if (status === 'success') {
      localStorage.setItem('ukpa_payment_status', 'success');
    }
    return status;
  } else if (storedPaymentStatus) {
    // Payment status from localStorage
    return storedPaymentStatus;
  } else if (sessionId) {
    // If session_id exists in URL, check if we can determine status
    // This might indicate a successful redirect from Stripe
    // You may need to verify with backend, but for now assume pending if session exists
    return 'pending';
  }
  
  // Default: pending (before payment or no payment info available)
  return 'pending';
}

// --- Helper function to set payment status (can be called after Stripe redirect) ---
export function setPaymentStatus(status) {
  // Valid statuses: 'success', 'pending', 'failed', 'cancelled'
  const validStatuses = ['success', 'pending', 'failed', 'cancelled'];
  if (validStatuses.includes(status.toLowerCase())) {
    localStorage.setItem('ukpa_payment_status', status.toLowerCase());
    console.log(`[Payment Status] Set to: ${status.toLowerCase()}`);
  } else {
    console.warn(`[Payment Status] Invalid status provided: ${status}`);
  }
}

// --- Function to trigger Zapier after payment success ---
async function triggerZapierAfterPayment(token) {
  try {
    // Get the saved form data from localStorage or reconstruct it
    // This should be called when user returns from payment with payment_status=success
    const paymentStatus = getPaymentStatus();
    if (paymentStatus === 'success' && token) {
      // Call backend to trigger Zapier with payment_status=success
      // The backend should have the saved contact and users data, and can update paymentStatus and trigger Zapier
      const response = await proxyToBackend('trigger-zapier', { 
        token: token,
        paymentStatus: 'success'
      }, 'POST');
      console.log('[triggerZapierAfterPayment] Response:', response);
      return response;
    }
  } catch (err) {
    console.error('[triggerZapierAfterPayment] Error:', err);
  }
}

// --- Auto-detect payment status from URL on page load ---
(function autoDetectPaymentStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment_status');
  const sessionId = urlParams.get('session_id');
  
  // If payment_status is in URL, store it
  if (paymentStatus) {
    setPaymentStatus(paymentStatus);
    
    // If payment was successful, check if we need to trigger Zapier
    if (paymentStatus === 'success') {
      // Try to get token from localStorage or URL
      const token = localStorage.getItem('ukpa_submission_token') || urlParams.get('token');
      if (token) {
        // Trigger Zapier with success status
        triggerZapierAfterPayment(token).catch(err => {
          console.error('Failed to trigger Zapier after payment:', err);
        });
      }
    }
  }
  // If session_id exists but no payment_status, we might want to check with backend
  // For now, we'll leave it as pending until backend confirms
})();

export async function collectAndSendFormData(totalUsers) {
  try {
    // Get payment status - only include it if payment has been completed
    // On initial submit (before payment), paymentStatus will be 'pending', so we skip Zapier trigger
    // Zapier should only be triggered AFTER payment is successful
    const paymentStatus = getPaymentStatus();
    
    // IMPORTANT: On initial submit (before payment), paymentStatus will be 'pending'
    // We set it to null/undefined so the backend doesn't trigger Zapier prematurely
    // Zapier should only be triggered AFTER payment is completed (success/failed/cancelled)
    const contact = {
      filerFullName: getValue('filerFullName'),
      filerEmail: getValue('filerEmail'),
      filerContactNumber: getValue('filerContactNumber'),
      // Only include paymentStatus if payment has been completed (not pending)
      // Backend should check: if paymentStatus is null/undefined, don't trigger Zapier
      // If paymentStatus is 'success', 'failed', or 'cancelled', then trigger Zapier
      ...(paymentStatus !== 'pending' && { paymentStatus: paymentStatus })
    };

    const users = [];
    const filesToUpload = [];

    // Debug logging
    console.log('DEBUG: Contact before submit:', contact);
    console.log('DEBUG: Payment status:', paymentStatus);
    console.log('DEBUG: totalUsers at submit:', totalUsers);
    if (!contact.filerFullName || !contact.filerEmail || !contact.filerContactNumber) {
      alert('❌ Please fill in your full name, email, and contact number before submitting.');
      throw new Error('Missing filerFullName, filerEmail, or filerContactNumber');
    }
    if (!totalUsers || isNaN(totalUsers) || totalUsers < 1) {
      alert('❌ Number of users is not set or invalid.');
      throw new Error('Invalid totalUsers');
    }

    for (let i = 1; i <= totalUsers; i++) {
      const personal = {
        firstName: getValue(`firstName-${i}`),
        middleName: getValue(`middleName-${i}`),
        lastName: getValue(`lastName-${i}`),
        firstNameDifferent: getValue(`firstName-different-${i}`),
        middleNameDifferent: getValue(`middleName-different-${i}`),
        lastNameDifferent: getValue(`lastName-different-${i}`),
        verificationName: getValue(`verificationName-${i}`),
        email: getValue(`email-${i}`),
        dob: getValue(`dob-${i}`),
        ukResident: getRadioValue(`ukResident-${i}`)
      };
      // Add remoteFaceVerification if checkbox is present
      const remoteFaceCheckbox = document.getElementById(`remoteFaceVerification-${i}`);
      if (remoteFaceCheckbox && remoteFaceCheckbox.checked) {
        personal.remoteFaceVerification = true;
      }

      const address = {
        addressLine1: getValue(`addressLine1-${i}`),
        addressLine2: getValue(`addressLine2-${i}`),
        city: getValue(`city-${i}`),
        county: getValue(`county-${i}`),
        country: getValue(`country-${i}`),
        postcode: getValue(`postcode-${i}`)
      };
      const proofInput = document.getElementById(`proofOfAddress-${i}`);
      console.log(`[DEBUG] Looking for proof of address input for user ${i}:`, proofInput);
      let proofOfAddressDriveFile = null;
      if (proofInput && proofInput.files && proofInput.files[0]) {
        console.log(`[DEBUG] Proof of address file found for user ${i}:`, proofInput.files[0]);
        filesToUpload.push({
          field: `proofOfAddress-${i}`,
          file: proofInput.files[0]
        });
        proofOfAddressDriveFile = { name: proofInput.files[0].name };
        console.log(`[DEBUG] Added proof of address to filesToUpload for user ${i}:`, proofOfAddressDriveFile);
      } else {
        console.log(`[DEBUG] No proof of address file found for user ${i}`);
        if (!proofInput) {
          console.log(`[DEBUG] Proof of address input element not found for user ${i}`);
          // Try to find it by name attribute as fallback
          const fallbackInput = document.querySelector(`input[name="proofOfAddress-${i}"]`);
          if (fallbackInput) {
            console.log(`[DEBUG] Found proof of address input by name for user ${i}:`, fallbackInput);
            if (fallbackInput.files && fallbackInput.files[0]) {
              console.log(`[DEBUG] Proof of address file found via fallback for user ${i}:`, fallbackInput.files[0]);
              filesToUpload.push({
                field: `proofOfAddress-${i}`,
                file: fallbackInput.files[0]
              });
              proofOfAddressDriveFile = { name: fallbackInput.files[0].name };
              console.log(`[DEBUG] Added proof of address to filesToUpload via fallback for user ${i}:`, proofOfAddressDriveFile);
            }
          }
        } else if (!proofInput.files) {
          console.log(`[DEBUG] Proof of address input has no files property for user ${i}`);
        } else if (!proofInput.files[0]) {
          console.log(`[DEBUG] Proof of address input has no files[0] for user ${i}`);
        }
      }
      address.proofOfAddress = proofOfAddressDriveFile;
      console.log(`[DEBUG] Final address object for user ${i}:`, address);

      const groupAUploads = [];
      const groupBUploads = [];

      // GROUP A
      for (const cb of document.querySelectorAll(`.groupA-checkbox[id$='-${i}']:checked`)) {
        const inputName = GROUP_A_INPUT_NAME_MAP[cb.value];
        if (!inputName) {
          throw new Error(`No mapping for Group A doc: ${cb.value}`);
        }
        const inputId = `${inputName}-${i}`;
        const fileInput = document.getElementById(inputId);
        if (!fileInput || !fileInput.files[0]) {
          throw new Error(`Missing file for ${cb.value}`);
        }
        // If we already uploaded via OCR and have a cached driveFile (e.g., passport),
        // do not re-attach the file to reduce payload size.
        const cachedDriveFile = uploadedFilesCache.get(`${cb.value}-${i}`);
        if (!cachedDriveFile) {
          filesToUpload.push({
            field: `${inputName}-${i}`,
            file: fileInput.files[0]
          });
        }
        // Find the doc definition in groupADocuments
        const docDef = groupADocuments.find(d => d.id === cb.value);
        const detailsObj = { type: cb.value, driveFile: cachedDriveFile || { name: fileInput.files[0].name } };
        if (docDef && Array.isArray(docDef.details)) {
          docDef.details.forEach(field => {
            // Compose the input name as in the DOM
            const fieldInputName = `${field.name}-${i}`;
            // For file, skip (already handled)
            if (field.type === 'file') return;
            detailsObj[field.name] = getValue(fieldInputName);
          });
        }
        // Debug log: print all collected values for this document
        console.log(`[DEBUG] GroupA Doc Collected for user ${i}, type ${cb.value}:`, detailsObj);
        groupAUploads.push(detailsObj);
      }
      // GROUP B
      for (const cb of document.querySelectorAll(`.groupB-checkbox[id$='-${i}']:checked`)) {
        const inputName = GROUP_B_INPUT_NAME_MAP[cb.value];
        if (!inputName) {
          throw new Error(`No mapping for Group B doc: ${cb.value}`);
        }
        const inputId = `${inputName}-${i}`;
        const fileInput = document.getElementById(inputId);
        if (!fileInput || !fileInput.files[0]) {
          throw new Error(`Missing file for ${cb.value}`);
        }
        filesToUpload.push({
          field: `${inputName}-${i}`,
          file: fileInput.files[0]
        });
        // Collect all document details, not just file name
        groupBUploads.push({
          type: cb.value,
          driveFile: { name: fileInput.files[0].name },
          docNumber: getValue(`docNumber-${cb.value}-${i}`),
          expiry: getValue(`expiry-${cb.value}-${i}`),
          issueDate: getValue(`issueDate-${cb.value}-${i}`),
          issuingCountry: getValue(`issuingCountry-${cb.value}-${i}`),
          // Add more fields as needed
        });
      }
      const documents = {
        groupA: groupAUploads,
        groupB: groupBUploads,
        proofOfAddress: proofOfAddressDriveFile, // Add proof of address to documents structure
        confirmDocs: document.getElementById(`confirmDocs-${i}`)?.checked || false
      };
      const confirmCheckbox = document.getElementById(`confirmDocs-${i}`);
      if (!confirmCheckbox || !confirmCheckbox.checked) {
        alert('You must confirm that the above information is true and you will provide the documents as requested.');
        confirmCheckbox && confirmCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        throw new Error('Confirmation checkbox not checked for user ' + i);
      }
      users.push({ personal, address, documents });
      console.log(`DEBUG: User ${i} personal:`, personal);
      console.log(`DEBUG: User ${i} address:`, address);
      console.log(`DEBUG: User ${i} documents:`, documents);
    }
    // After loop, log the final users array before submit
    console.log('DEBUG: Final users array before submit:', users);
    console.log('DEBUG: filesToUpload array before submit:', filesToUpload);

    // --- Submit to backend via WP AJAX proxy ---
    const formData = new FormData();
    formData.append('action', 'ukpa_idv_proxy');
    formData.append('nonce', window.ukpa_idv_form_data.nonce);
    formData.append('endpoint', 'dataSubmit');
    formData.append('method', 'POST');
    formData.append('contact', JSON.stringify(contact));
    formData.append('users', JSON.stringify(users));
    for (const fileObj of filesToUpload) {
      console.log(`[DEBUG] Adding file to FormData: ${fileObj.field}`, fileObj.file);
      formData.append(fileObj.field, fileObj.file);
    }
    console.log('[DEBUG] FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`[DEBUG] FormData key: ${key}, value type: ${typeof value}`);
    }
    // Check specifically for proof of address files
    const proofOfAddressFiles = filesToUpload.filter(f => f.field.startsWith('proofOfAddress'));
    console.log('[DEBUG] Proof of address files in filesToUpload:', proofOfAddressFiles);
    console.log('[DEBUG] FormData contains proof of address files:', Array.from(formData.entries()).filter(([key]) => key.startsWith('proofOfAddress')));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file uploads
    
    let response;
    try {
      response = await fetch(window.ukpa_idv_form_data.ajaxurl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error('Request timed out. The form submission is taking too long. Please check your internet connection and try again.');
      } else if (fetchErr.message.includes('Failed to fetch') || fetchErr.message.includes('Couldn\'t connect')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and ensure the backend server is running.');
      }
      throw fetchErr;
    }
    
    const saveRes = await response.json();
    console.log('[collectAndSendFormData] dataSubmit response:', saveRes);
    // Robustly parse the response to extract token
    let saveResParsed = saveRes;
    // Try to handle all possible proxy response shapes
    function tryParse(obj) {
      if (!obj) return obj;
      if (typeof obj === 'string') {
        try { return JSON.parse(obj); } catch { return obj; }
      }
      return obj;
    }
    // Unwrap nested body/data/body if needed
    saveResParsed = tryParse(saveResParsed);
    if (saveResParsed && saveResParsed.body) saveResParsed = tryParse(saveResParsed.body);
    if (saveResParsed && saveResParsed.data) saveResParsed = tryParse(saveResParsed.data);
    if (saveResParsed && saveResParsed.body) saveResParsed = tryParse(saveResParsed.body);
    console.log('[collectAndSendFormData] dataSubmit parsed:', saveResParsed);
    if (!saveResParsed || typeof saveResParsed !== 'object') {
      alert('Form submission failed: Unexpected server response.');
      throw new Error('Form submission failed: Unexpected server response.');
    }
    if (!saveResParsed.token) {
      alert('Form submission failed: ' + (saveResParsed.message || 'No token returned from backend.'));
      throw new Error(saveResParsed.message || 'Saving form data failed');
    }
    // Save token to localStorage so we can use it to trigger Zapier after payment success
    localStorage.setItem('ukpa_submission_token', saveResParsed.token);
    console.log('[collectAndSendFormData] Token saved for later Zapier trigger:', saveResParsed.token);
    
    // --- Create Stripe session via proxy ---
    const stripeRes = await proxyToBackend(
      'create-checkout-session',
      { users, token: saveResParsed.token },
      'POST'
    );
    console.log('[collectAndSendFormData] create-checkout-session raw response:', stripeRes);
    let stripeResParsed = stripeRes;
    // Try to handle all possible proxy response shapes
    function tryParseStripe(obj) {
      if (!obj) return obj;
      if (typeof obj === 'string') {
        try { return JSON.parse(obj); } catch { return obj; }
      }
      return obj;
    }
    stripeResParsed = tryParseStripe(stripeResParsed);
    if (stripeResParsed && stripeResParsed.body) stripeResParsed = tryParseStripe(stripeResParsed.body);
    if (stripeResParsed && stripeResParsed.data) stripeResParsed = tryParseStripe(stripeResParsed.data);
    if (stripeResParsed && stripeResParsed.body) stripeResParsed = tryParseStripe(stripeResParsed.body);
    console.log('[collectAndSendFormData] create-checkout-session parsed:', stripeResParsed);
    if (!stripeResParsed.url) {
      console.error('[collectAndSendFormData] Stripe session missing url:', stripeResParsed);
      throw new Error(stripeResParsed.message || 'Stripe session failed');
    }
    setSubmitOverlayMessage('You will be redirected to the payment method. Please hold on...');
    window.removeEventListener('beforeunload', window.__submissionBeforeUnloadHandler);
    console.log('[collectAndSendFormData] Redirecting to Stripe URL:', stripeResParsed.url);
    window.location.href = stripeResParsed.url;

  } catch (err) {
    console.error('[collectAndSendFormData] Error:', err);
    
    // Hide overlay if it's showing
    const overlay = document.getElementById('submitOverlay');
    if (overlay) overlay.style.display = 'none';
    
    // Re-enable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = false;
    
    // Remove beforeunload handler
    if (window.__submissionBeforeUnloadHandler) {
      window.removeEventListener('beforeunload', window.__submissionBeforeUnloadHandler);
    }
    
    // Show user-friendly error message
    let errorMessage = 'An error occurred while submitting the form.';
    if (err.message) {
      if (err.message.includes('timeout') || err.message.includes('timed out')) {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (err.message.includes('connect') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
      } else {
        errorMessage = err.message;
      }
    }
    
    alert(`❌ Error: ${errorMessage}`);
  }
}

// ✅ Helpers
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name='${name}']:checked`);
  return checked ? checked.value : '';
}