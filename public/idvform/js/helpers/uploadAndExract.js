// Global storage for uploaded files to prevent duplicate uploads
// function getApiBaseUrlUp() {
//   return window.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/ana';
// }
const uploadedFilesCache = new Map();

export async function uploadAndExtract(file, userId, loadingText) {
  const token = document.querySelector('meta[name="plugin-token"]')?.content || '';
  const filerEmail = document.getElementById('filerEmail')?.value || '';
  const filerFullName = document.getElementById('filerFullName')?.value || '';
  const userFirstName = document.getElementById(`firstName-${userId}`)?.value || '';
  const userLastName = document.getElementById(`lastName-${userId}`)?.value || '';
  const { ajaxurl, nonce } = window.ukpa_api_data || {};

  // Prepare FormData for proxy
  const formData = new FormData();
  formData.append('action', 'ukpa_proxy_api');
  formData.append('route', 'ocrUpload/ocrExtract');
  formData.append('nonce', nonce || '');
  formData.append('doc', file);
  formData.append('docType', 'passport');
  formData.append('filerEmail', filerEmail);
  formData.append('filerFullName', filerFullName);
  formData.append('userIndex', userId);
  formData.append('userFirstName', userFirstName);
  formData.append('userLastName', userLastName);
  formData.append('x-plugin-auth', token);

  try {
    const res = await fetch(ajaxurl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }

    const json = await res.json();
    // The proxy handler should return the Node backend's response in json.data.body
    const nodeResponse = json?.data?.body || json;
    if (!nodeResponse.fields) throw new Error("No fields returned in response");

    // Store the uploaded file information for reuse during form submission
    if (nodeResponse.driveFile) {
      const cacheKey = `passport-${userId}`;
      uploadedFilesCache.set(cacheKey, nodeResponse.driveFile);
    }

    setTimeout(() => {
      const fields = nodeResponse.fields;
      if (fields.passportNumber) {
        const passportNumberInput = document.querySelector(`input[name="passportNumber-${userId}"]`);
        if (passportNumberInput) passportNumberInput.value = fields.passportNumber;
      }
      if (fields.expiry) {
        const expiryInput = document.querySelector(`input[name="passportExpiry-${userId}"]`);
        if (expiryInput) expiryInput.value = fields.expiry;
      }
      if (fields.issuingCountry) {
        const countrySelect = document.querySelector(`select[name="passportCountry-${userId}"]`);
        if (countrySelect) {
          const matchedOption = Array.from(countrySelect.options).find(
            opt => opt.value.toLowerCase() === fields.issuingCountry.toLowerCase()
          );
          if (matchedOption) {
            countrySelect.value = matchedOption.value;
          }
        }
      }
      console.log("values are", fields);
    }, 90);
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
