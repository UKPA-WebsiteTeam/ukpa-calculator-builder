import { renderResults } from './renderResults.js';

export function sendToBackend(inputs) {
  if (!window.ukpa_api_data?.base_url || !window.ukpa_api_data?.plugin_token) {
    console.warn('⚠️ Missing plugin token or API URL.');
    return;
  }

  const payload = {};
  for (const [elementId, value] of Object.entries(inputs)) {
    const inputEl = document.querySelector(`[name="${elementId}"]`);
    const wrapper = inputEl?.closest('.ukpa-element');
    const config = wrapper ? JSON.parse(wrapper.dataset.config || '{}') : {};
    const paramName = config.name?.trim() || config.label?.trim() || elementId;

    if (paramName) {
      payload[paramName] = value;
    }
  }

  console.log("📤 Sending to backend:", payload);

  const requestUrl = `${window.ukpa_api_data.base_url}/routes/mainRouter/${window.ukpa_api_data.backend_route}`;
  console.log("📡 Fetching from:", requestUrl);

  fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Plugin-Auth': window.ukpa_api_data.plugin_token
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  })
    .then(async res => {
      console.log("📥 Raw Response:", res);
      const data = await res.json();
      console.log("✅ Parsed Response:", data);

      if (res.ok && typeof data === 'object') {
            window.ukpaResults = data;
            renderResults();
      } else {
        console.warn("🟡 Error from API:", data.message || data);
      }
    })
    .catch(err => {
      console.error("❌ Fetch error:", err);
    });
}
