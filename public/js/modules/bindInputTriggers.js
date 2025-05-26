import { applyAllConditions } from './applyAllConditions.js';
import { sendToBackend } from './sendToBackend.js';
import { allRequiredFieldsFilled } from '../frontend.js';

export function bindInputTriggers(inputBox, contentSection, resultContainer) {
  const inputs = inputBox?.querySelectorAll("input, select, textarea");
  if (!inputs) return;

  let hasSwitched = false;

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      console.log(`🔁 Input changed: ${input.id || input.name}`);
      applyAllConditions();

      // ✅ Check BEFORE doing anything else
      if (!allRequiredFieldsFilled()) {
        console.warn('🛑 Required fields missing. No switch or API call.');
        return;
      }

      // ✅ Now safe to reveal result section
      if (!hasSwitched) {
        if (contentSection) contentSection.style.display = "none";
        if (resultContainer) resultContainer.style.display = "flex";
        if (inputBox) inputBox.style.width = "60%";
        hasSwitched = true;
      }

      const collected = {};
      inputs.forEach(el => {
        const key = el.name || el.dataset.name || el.id;
        collected[key] = el.type === 'checkbox' ? el.checked : el.value;
      });

      console.log('✅ Sending to backend:', collected);
      sendToBackend(collected);
    });
  });
}
