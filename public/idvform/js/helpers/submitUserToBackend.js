import { collectFormData } from './collectFormData.js';

export async function submitUserToBackend() {
  const token = document.querySelector('meta[name="plugin-token"]').content;
  const payload = collectFormData();

  console.log("📦 Payload to backend:", payload);

  try {
    const res = await fetch("https://ukpacalculator.com/ana/v1/routes/mainRouter/ocrUpload/dataSubmit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-plugin-auth": token
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to save user");

    console.log("✅ User saved:", result);
  } catch (err) {
    alert("❌ Failed to submit user data: " + err.message);
    console.error(err);
  }
}
