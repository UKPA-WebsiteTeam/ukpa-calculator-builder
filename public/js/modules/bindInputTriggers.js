import { applyAllConditions } from './applyAllConditions.js';
import { allRequiredFieldsFilled } from '../frontend.js';
import { debouncedSendToBackend } from '../frontend.js'; 

export function bindInputTriggers(inputBox, contentSection, resultContainer) {
  const inputs = inputBox?.querySelectorAll("input, select, textarea");
  if (!inputs) return;

  let hasSwitched = false;

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      console.log(`🔁 Input changed: ${input.id || input.name}`);
      applyAllConditions();

      // ✅ Skip backend call if required fields aren't filled
      if (!allRequiredFieldsFilled()) {
        console.warn('🛑 Required fields missing. No switch or API call.');
        return;
      }

      // ✅ Transition UI only once
      if (!hasSwitched) {
        if (contentSection) contentSection.style.display = "none";
        if (resultContainer) resultContainer.style.display = "flex";
        if (inputBox) inputBox.style.width = "60%";
        hasSwitched = true;
      }

      // ✅ Collect input values
      const collected = {};
      inputs.forEach(el => {
        const key = el.name || el.dataset.name || el.id;
        collected[key] = el.type === 'checkbox' ? el.checked : el.value;
      });

      console.log('✅ Debounced send to backend:', collected);
      debouncedSendToBackend(collected); // ✅ Use debounced call here
    });
  });
}
