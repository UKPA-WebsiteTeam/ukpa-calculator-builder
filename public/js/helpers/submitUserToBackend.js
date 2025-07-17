import { collectFormData } from './collectFormData.js';
import { proxyToBackend, getApiBaseUrl } from '../../idvform-modular-testing/collectAndSendFormData.js';

export async function submitUserToBackend() {
  const token = document.querySelector('meta[name="plugin-token"]').content;
  const payload = collectFormData();

  console.log("📦 Payload to backend:", payload);

  try {
    const target_url = `${getApiBaseUrl()}/v1/routes/mainRouter/ocrUpload/dataSubmit`;
    const result = await proxyToBackend(target_url, payload, 'POST');
    if (!result || result.error) throw new Error(result.message || result.error || "Failed to save user");
    console.log("✅ User saved:", result);
  } catch (err) {
    alert("❌ Failed to submit user data: " + err.message);
    console.error(err);
  }
}
