  import { submitUserToBackend } from './submitUserToBackend.js';
  export async function handleFinalSubmission() {
    try {
      await submitUserToBackend(); // Step 1: Send data

      // Step 3: Get UK Resident radio value
      const residentValue = document.querySelector('input[name="ukResident"]:checked')?.value;
      if (residentValue !== "yes" && residentValue !== "no") {
        throw new Error("Please select UK Resident status");
      }

      const isUkResident = residentValue === "yes";

      // Step 4: Request Stripe Checkout session
      const stripeRes = await fetch("https:ukpacalculator.com/ana/v1/routes/mainRouter/ocrUpload/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // userId: userId,
          residentValue: isUkResident,
        })
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok || !stripeData.url) throw new Error(stripeData.message || "Stripe session failed");

      // Step 5: Redirect to Stripe
      window.location.href = stripeData.url;

    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    }
  }