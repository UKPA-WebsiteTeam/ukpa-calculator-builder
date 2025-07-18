import { setSubmitOverlayMessage } from './index.js';
import { uploadedFilesCache } from "../js/helpers/uploadAndExract.js";
// Remove dotenv import and config
// Helper to get API base URL from environment or fallback
export function getApiBaseUrl() {
  return 'http://localhost:3002/ana';
}

// --- Helper to send requests via WP proxy ---
export async function proxyToBackend(endpoint, payload, method = 'POST') {
  const response = await fetch(window.ukpa_idv_form_data.ajaxurl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'ukpa_idv_proxy',
      nonce: window.ukpa_idv_form_data.nonce,
      endpoint, // e.g., 'ocrExtract', 'dataSubmit', etc.
      method,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload)
    })
  });
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

export async function collectAndSendFormData(totalUsers) {
  try {
    const contact = {
      filerFullName: getValue('filerFullName'),
      filerEmail: getValue('filerEmail')
    };

    const users = [];

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
        let proofOfAddressDriveFile = null;
        if (proofInput && proofInput.files && proofInput.files[0]) {
          proofOfAddressDriveFile = await uploadDocument(proofInput.files[0], 'proofOfAddress', i);
          if (!proofOfAddressDriveFile) throw new Error('Upload failed for proof of address');
        }
        address.proofOfAddress = proofOfAddressDriveFile;
      
      const uploadedFiles = {}; // One upload per unique input

      const groupAUploads = [];
      const groupBUploads = [];

      // ✅ GROUP A with map
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

        if (!uploadedFiles[inputName]) {
          const driveFile = await uploadDocument(fileInput.files[0], cb.value, i);
          if (!driveFile) throw new Error(`Upload failed for ${cb.value}`);
          uploadedFiles[inputName] = driveFile;
        }

        groupAUploads.push({
          type: cb.value,
          driveFile: uploadedFiles[inputName]
        });
      }

      // ✅ GROUP B with map
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

        if (!uploadedFiles[inputName]) {
          const driveFile = await uploadDocument(fileInput.files[0], cb.value, i);
          if (!driveFile) throw new Error(`Upload failed for ${cb.value}`);
          uploadedFiles[inputName] = driveFile;
        }

        groupBUploads.push({
          type: cb.value,
          driveFile: uploadedFiles[inputName]
        });
      }

      const documents = {
        groupA: groupAUploads,
        groupB: groupBUploads,
        confirmDocs: document.getElementById(`confirmDocs-${i}`)?.checked || false
      };

      // Require confirmDocs checkbox to be checked
      const confirmCheckbox = document.getElementById(`confirmDocs-${i}`);
      if (!confirmCheckbox || !confirmCheckbox.checked) {
        alert('You must confirm that the above information is true and you will provide the documents as requested.');
        confirmCheckbox && confirmCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        throw new Error('Confirmation checkbox not checked for user ' + i);
      }

      users.push({ personal, address, documents });
    }

    // --- Submit to backend via proxy ---
    const formPayload = { contact, users };
    console.log('[collectAndSendFormData] Submitting formPayload:', formPayload);
    const saveRes = await proxyToBackend(
      'dataSubmit',
      formPayload,
      'POST'
    );
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
    console.error(err);
    alert(`❌ Error: ${err.message}`);
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
