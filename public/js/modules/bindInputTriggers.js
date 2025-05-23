import { applyAllConditions } from './applyAllConditions.js';
import { sendToBackend } from './sendToBackend.js';

export function bindInputTriggers(inputBox, contentSection, resultContainer) {
  const inputs = inputBox?.querySelectorAll("input, select, textarea");
  if (!inputs) return;

  let hasSwitched = false;

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      if (!hasSwitched) {
        if (contentSection) contentSection.style.display = "none";
        if (resultContainer) resultContainer.style.display = "flex";
        if (inputBox) inputBox.style.width = "60%";
        hasSwitched = true;
      }

      applyAllConditions();

      const collected = {};
      inputs.forEach(el => {
        if (el.type === 'checkbox') {
          collected[el.name] = el.checked;
        } else {
          collected[el.name] = el.value;
        }
      });

      sendToBackend(collected);
    });
  });
}
