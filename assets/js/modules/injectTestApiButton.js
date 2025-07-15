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

    const ajaxurl = ukpa_api_data.ajaxurl;
    const localBaseUrl = ukpa_api_data.local_base_url;
    const liveBaseUrl = ukpa_api_data.live_base_url;

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

    async function tryApi(baseUrl) {
      console.log(`[UKPA] Trying API: ${baseUrl}`);
      const response = await fetch(`${baseUrl}/routes/mainRouter/${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    }

    let apiData = null;
    try {
      try {
        apiData = await tryApi(localBaseUrl);
        console.log('[UKPA] Used local backend:', localBaseUrl);
      } catch (err) {
        console.warn('[UKPA] Local backend failed, trying live backend:', err);
        apiData = await tryApi(liveBaseUrl);
        console.log('[UKPA] Used live backend:', liveBaseUrl);
      }

      if (apiData && typeof apiData === 'object') {
        const keys = getTopLevelKeysForDropdown(apiData);
        window.ukpaResults = apiData;
        window.ukpaResultKeys = keys;

        const resultKeysSavePayload = new FormData();
        resultKeysSavePayload.append('action', 'ukpa_save_result_keys');
        resultKeysSavePayload.append('calc_id', window.ukpaCalculatorId);
        resultKeysSavePayload.append('keys', JSON.stringify(keys));
        resultKeysSavePayload.append('_wpnonce', ukpa_calc_data?.nonce);
        resultKeysSavePayload.append('sample', JSON.stringify(apiData));

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
        console.warn("🟡 API Error:", apiData?.message || apiData);
      }

    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  });
}
