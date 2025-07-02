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

    const isNumberField = (inputEl?.type === 'number') || inputEl?.classList.contains('ukpa-number-input');
    const isDateField = (inputEl?.type === 'date') || inputEl?.classList.contains('ukpa-date-input');

    if (isNumberField) {
      // Remove commas and parse to float. Fallback to 0 if empty/invalid.
      const numericStr = String(value ?? '').replace(/,/g, '');
      finalValue = numericStr === '' || isNaN(numericStr) ? 0 : parseFloat(numericStr);
    } else if (isDateField) {
      // Convert to YYYY-MM-DD if possible, including flatpickr's '01 July 2022' format
      if (value) {
        let d;
        // Try to parse 'DD MMMM YYYY' (e.g., '01 July 2022')
        const flatpickrMatch = value.match(/^(\d{2}) ([A-Za-z]+) (\d{4})$/);
        if (flatpickrMatch) {
          const [ , day, monthName, year ] = flatpickrMatch;
          // Map month name to number
          const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
          const monthIdx = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
          if (monthIdx !== -1) {
            d = new Date(Number(year), monthIdx, Number(day));
          }
        } else {
          d = new Date(value);
        }
        if (d && !isNaN(d)) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          finalValue = `${yyyy}-${mm}-${dd}`;
        }
      }
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

    const text = await response.text();
    console.log('Raw response text:', text);
    let data;
    try {
      data = JSON.parse(text);
      console.log("✅ Parsed Response:", data);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      data = null;
    }
    console.log("📥 Raw Response:", response);

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
