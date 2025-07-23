import { collectFormData } from './collectFormData.js';
import { proxyToBackend } from '../../idvform-modular-testing/collectAndSendFormData.js';

export async function submitUserToBackend() {
  const token = document.querySelector('meta[name="plugin-token"]').content;
  const payload = collectFormData();

  console.log("📦 Payload to backend:", payload);

  try {
    // Use proxyToBackend or centralized AJAX proxy logic instead of direct URL
    const result = await proxyToBackend(target_url, payload, 'POST');
    if (!result || result.error) throw new Error(result.message || result.error || "Failed to save user");
    console.log("✅ User saved:", result);
  } catch (err) {
    alert("❌ Failed to submit user data: " + err.message);
    console.error(err);
  }
}
