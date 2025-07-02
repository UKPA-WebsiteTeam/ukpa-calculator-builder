import { renderResultsFrontend } from './renderResultsFrontend.js';

// ✅ Debounce helper
function debounce(func, wait = 600) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// ✅ Actual backend request
export async function sendToBackend(inputs) {
  const { base_url, plugin_token, backend_route } = window.ukpa_api_data || {};

  if (!base_url || !plugin_token || !backend_route) {
    console.warn('⚠️ Missing plugin token, API URL, or backend route.');
    return;
  }

  const payload = {};
  for (const [elementId, value] of Object.entries(inputs)) {
    const inputEl = document.querySelector(`[name="${elementId}"]`);
    const wrapper = inputEl?.closest('.ukpa-element');
    const config = wrapper ? JSON.parse(wrapper.dataset.config || '{}') : {};
    const paramName = config.name?.trim() || config.label?.trim() || elementId;

    let finalValue = value;

    // Detect if this is a number element via wrapper data-type
    const isNumberInput = wrapper?.dataset.type === 'number';

    if (isNumberInput && typeof value === 'string') {
      const sanitized = value.replace(/,/g, '');
      finalValue = sanitized === '' ? 0 : Number(sanitized);
    } else if (inputEl?.type === 'number' && (value === '' || value === null || value === undefined)) {
      finalValue = 0;
    }

    if (paramName) {
      payload[paramName] = finalValue;
    }
  }

  console.log("📤 Sending to backend:", payload);

  const requestUrl = `${base_url}/routes/mainRouter/${backend_route}`;
  console.log("📡 Fetching from:", requestUrl);

  const statusDiv = document.getElementById('ab-lead-status');
  // Only show 'Submitting...' if user has filled email — i.e. actual form use
  if (document.querySelector('#ab-email')?.value?.trim()) {
    statusDiv.textContent = 'Submitting...';
  }

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Plugin-Auth': plugin_token
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("📥 Raw Response:", response);
    console.log("✅ Parsed Response:", data);

    const errorBox = document.getElementById('ukpa-error-message');
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }

    // ✅ Updated condition: trust any 200 OK response for now
    if (response.ok) {
      window.ukpaResults = data;
      renderResultsFrontend(); // Render the updated results

      // ✅ Reopen editor if one is active
      if (window.currentEditingElementId) {
        window.editElementById(window.currentEditingElementId);
      }
    } else {
      console.warn("🟡 Error from API:", data.message || data);
      if (errorBox) {
        errorBox.textContent = data.message || 'Something went wrong.';
        errorBox.style.display = 'block';
      }
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
    const errorBox = document.getElementById('ukpa-error-message');
    if (errorBox) {
      errorBox.textContent = 'Network error. Please try again.';
      errorBox.style.display = 'block';
    }
  } finally {
    statusDiv.textContent = ''; // Reset loading state
  }
}

// ✅ Debounced version to use in input triggers
export const debouncedSendToBackend = debounce(sendToBackend, 600);

// Optional: export debounce if you want to reuse it
export { debounce };
