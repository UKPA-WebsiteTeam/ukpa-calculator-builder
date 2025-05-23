import { flattenKeys } from './flattenKeys.js';
import { getTopLevelKeysForDropdown } from '../modules/getTopLevelKeysForDropdown.js';

export function injectTestApiButton(saveBtn) {

  const testButton = document.createElement("button");
  testButton.id = "ukpa-test-api-btn";
  testButton.textContent = "Test API";
  testButton.className = "button button-secondary";
  testButton.style.marginLeft = "12px";

  saveBtn.parentNode.insertBefore(testButton, saveBtn.nextSibling);

  testButton.addEventListener("click", async (e) => {
    e.preventDefault();

    if (typeof ukpa_api_data === 'undefined') {
      alert("API config missing");
      return;
    }

    const route = document.getElementById("ukpa-backend-route")?.value;
    if (!route) {
      alert("Please select a backend route.");
      return;
    }

    const fullUrl = `${ukpa_api_data.base_url}/routes/mainRouter/${route}`;
    const inputs = document.querySelectorAll(
      "#inputs-preview .ukpa-element input, #inputs-preview .ukpa-element select, #inputs-preview .ukpa-element textarea"
    );

    const payload = {};
    inputs.forEach(el => {
      const wrapper = el.closest('.ukpa-element');
      const config = wrapper?.dataset.config ? JSON.parse(wrapper.dataset.config) : {};
      const paramName = config.name?.trim() || config.label?.trim();
      const value = el.type === 'checkbox' ? el.checked : el.value;
      if (paramName && value !== '') payload[paramName] = value;
    });

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Plugin-Auth": ukpa_api_data.plugin_token
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      const apiData = result.result && typeof result.result === 'object' ? result.result : result;

      if (response.ok && apiData && typeof apiData === 'object') {
        const keys = getTopLevelKeysForDropdown(apiData);
        window.ukpaResults = apiData;
        window.ukpaResultKeys = keys;

        const resultKeysSavePayload = new FormData();
        resultKeysSavePayload.append('action', 'ukpa_save_result_keys');
        resultKeysSavePayload.append('calc_id', window.ukpaCalculatorId);
        resultKeysSavePayload.append('keys', JSON.stringify(keys));
        resultKeysSavePayload.append('_wpnonce', ukpa_calc_data?.nonce);

        fetch(ukpa_api_data.ajaxurl, {
          method: 'POST',
          body: resultKeysSavePayload
        })
          .then(res => res.json())
          .then(json => {
            if (json.success) {
              console.log("✅ Result keys saved.");
            } else {
              console.warn("⚠️ DB save failed:", json.data?.message || json);
            }
          });

        window.renderResults();

        const openWrapper = document.querySelector('#ukpa-element-editor-body .ukpa-editor-wrapper');
        const currentId = openWrapper?.dataset?.id;
        if (currentId && typeof window.editElementById === 'function') {
          window.editElementById(currentId);
        }
      } else {
        console.warn("🟡 API Error:", result.message || result);
      }

    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  });
}
