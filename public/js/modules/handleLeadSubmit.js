export async function handleLeadSubmit(event) {
  event.preventDefault();

  const statusDiv = document.getElementById('ab-lead-status');
  statusDiv.textContent = 'Submitting...';

  const fullName = document.getElementById('ab-fullName')?.value.trim();
  const email = document.getElementById('ab-email')?.value.trim();
  const consent = document.getElementById('ab-consent')?.checked;

  if (!consent) {
    statusDiv.textContent = '❌ You must give consent.';
    return;
  }

  // ✅ Extract input values (label: value)
  const inputElements = document.querySelectorAll('.ab-input input, .ab-input select, .ab-input textarea');
  const inputValues = {};

  inputElements.forEach(el => {
    const fieldWrapper = el.closest('.ukpa-element') || el.parentElement;
    let labelText = '';

    if (fieldWrapper) {
      const label = fieldWrapper.querySelector('label');
      if (label) {
        labelText = label.textContent.trim().replace(/[:*]+$/, '');
      }
    }

    const key = labelText || el.name || 'Unnamed Field';

    if (el.type === 'radio') {
      if (el.checked) inputValues[key] = el.value;
    } else if (el.type === 'checkbox') {
      inputValues[key] = el.checked;
    } else {
      inputValues[key] = el.value;
    }
  });

  // ✅ Extract calculatedResults exactly as returned
  const outputs = window.ukpaResults?.calculatedResults || {};

  // ✅ Meta Info
  const { ajaxurl, nonce, plugin_token, website } = window.ukpa_api_data || {};
  const calculatorId = window.ukpaCalculatorId || '';
  const calculatorName =
  window.ukpa_calc_data?.title?.split(/[|–-]/)[0].trim() ||
  document.querySelector('.ukpa-builder-header h1')?.textContent?.replace(/^Edit Calculator:\s*/, '') ||
  document.title.split(/[|–-]/)[0].trim() ||
  'Untitled Calculator';

  const payload = {
    fullName,
    email,
    website,
    calculatorId,
    calculatorName,
    inputs: inputValues,
    outputs,
    relatedServices: {}
  };

  // ✅ DEBUG: Log the final payload to be sent
  console.log("📦 Submitting Lead Payload:", payload);

  try {
    const response = await fetch(`${ajaxurl}?action=ukpa_proxy_api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'leadForm',
        payload,
        nonce: nonce || '',
      }),
      credentials: 'same-origin',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Submission failed');

    statusDiv.textContent = '✅ Submitted successfully!';
  } catch (err) {
    console.error(err);
    statusDiv.textContent = '❌ Error: ' + err.message;
  }
}
