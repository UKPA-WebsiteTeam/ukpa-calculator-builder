export function saveCalculatorLayout() {
  const elements = [];
  document.querySelectorAll('.ukpa-preview .ukpa-element').forEach(el => {
    const section = el.closest('[data-section]')?.dataset.section || 'unknown';
    const config = el.getAttribute('data-config');

    const htmlClone = el.cloneNode(true);
    const label = htmlClone.querySelector('.ukpa-admin-id-label');
    if (label) label.remove();

    elements.push({
      id: el.dataset.id,
      type: el.dataset.type,
      section,
      html: htmlClone.innerHTML,
      config: config ? JSON.parse(config) : {}
    });
  });

  // ✅ Extract other core fields
  const title = document.getElementById('ukpa-calc-title')?.value || 'Untitled Calculator';
  const route = document.getElementById('ukpa-backend-route')?.value || '';
  const custom_css = window.cssEditor ? window.cssEditor.getValue() : '';
  const custom_js = window.jsEditor ? window.jsEditor.getValue() : '';
  const dynamicKeys = window.dynamicResultKeys || [];

  // ✅ Future-safe: extract any custom HTML blocks if needed
  const customTopHTML = document.getElementById('ukpa_custom_top_html')?.value || '';
  const customBottomHTML = document.getElementById('ukpa_custom_bottom_html')?.value || '';

  const formData = new FormData();
  formData.append('action', 'ukpa_unified_save_calculator');
  formData.append('calculator_id', window.ukpaCalculatorId);
  formData.append('title', title);
  formData.append('backend_route', route);
  formData.append('custom_css', custom_css);
  formData.append('custom_js', custom_js);
  formData.append('elements', JSON.stringify(elements));
  formData.append('dynamic_keys', JSON.stringify(dynamicKeys));
  formData.append('_wpnonce', ukpa_calc_data.nonce);

  // ✅ Optional: include other sections if supported later
  formData.append('custom_top_html', customTopHTML);
  formData.append('custom_bottom_html', customBottomHTML);

  fetch(ukpa_calc_data.ajaxurl, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: formData,
  })
    .then(res => res.text())
    .then(text => {
      try {
        const data = JSON.parse(text);
        console.log("✅ Calculator saved:", data);
        if (data.success) {
          window.isDirty = false;
        } else {
          console.error("❌ Save failed:", data.data?.message);
        }
      } catch (e) {
        console.error("❌ Could not parse JSON:", e, text);
      }
    })
    .catch(err => {
      console.error("❌ Save request failed:", err);
    });
}
