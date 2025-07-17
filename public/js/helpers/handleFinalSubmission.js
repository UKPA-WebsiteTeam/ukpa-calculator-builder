import { submitUserToBackend } from './submitUserToBackend.js';
import { proxyToBackend, getApiBaseUrl } from '../../idvform-modular-testing/collectAndSendFormData.js';
export async function handleFinalSubmission() {
  try {
    await submitUserToBackend(); // Step 1: Send data

    // Step 3: Get UK Resident radio value
    const residentValue = document.querySelector('input[name="ukResident"]:checked')?.value;
    if (residentValue !== "yes" && residentValue !== "no") {
      throw new Error("Please select UK Resident status");
    }

    const isUkResident = residentValue === "yes";

    // Step 4: Request Stripe Checkout session via proxy
    const target_url = `${getApiBaseUrl()}/v1/routes/mainRouter/ocrUpload/create-checkout-session`;
    const stripeData = await proxyToBackend(target_url, { residentValue: isUkResident }, 'POST');
    if (!stripeData || !stripeData.url) throw new Error(stripeData.message || "Stripe session failed");

    // Step 5: Redirect to Stripe
    window.location.href = stripeData.url;

  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error(err);
  }
}