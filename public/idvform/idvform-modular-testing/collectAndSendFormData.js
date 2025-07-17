import { setSubmitOverlayMessage } from './index.js';
import { uploadedFilesCache } from "../js/helpers/uploadAndExract.js";
// Remove dotenv import and config
// Helper to get API base URL from environment or fallback
export function getApiBaseUrl() {
  return 'https://ukpacalculator.com/ana';
}

// ✅ Helper to upload a document once and reuse the Drive file link
async function uploadDocument(file, docType, userIndex) {
  // Check if we already have this file uploaded (for passport documents)
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
  
  // Add filer information for folder organization
  const filerEmail = getValue('filerEmail');
  const filerFullName = getValue('filerFullName');
  formData.append('filerEmail', filerEmail);
  formData.append('filerFullName', filerFullName);
  
  // Add user information for subfolder creation
  const userFirstName = getValue(`firstName-${userIndex}`);
  const userLastName = getValue(`lastName-${userIndex}`);
  formData.append('userFirstName', userFirstName);
  formData.append('userLastName', userLastName);

  const response = await fetch(`${getApiBaseUrl()}/v1/routes/mainRouter/ocrUpload`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    // Return the file info object (matches backend response)
    return {
      filePath: result.filePath,
      fileName: result.fileName,
      link: result.link,
      storageType: result.storageType,
      local: result.local
    };
  } else {
    alert('Upload failed: ' + result.error);
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

    // ✅ Save to backend
    const saveRes = await fetch(`${getApiBaseUrl()}/v1/routes/mainRouter/ocrUpload/dataSubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, users })
    });

    if (!saveRes.ok) throw new Error('Saving form data failed');
    const saveData = await saveRes.json();
    const token = saveData.token;
    if (!token) throw new Error('Missing token from backend');

    // ✅ Create Stripe session
    const stripeRes = await fetch(`${getApiBaseUrl()}/v1/routes/mainRouter/ocrUpload/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users, token })
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || !stripeData.url) throw new Error(stripeData.message || 'Stripe session failed');

    // Update overlay message and remove beforeunload handler before redirect
    setSubmitOverlayMessage('You will be redirected to the payment method. Please hold on...');
    window.removeEventListener('beforeunload', window.__submissionBeforeUnloadHandler);
    window.location.href = stripeData.url;

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
