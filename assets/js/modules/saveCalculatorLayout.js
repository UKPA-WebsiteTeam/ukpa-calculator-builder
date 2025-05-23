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

  const title = document.getElementById("ukpa-calc-title")?.value || "Untitled Calculator";
  const route = document.getElementById("ukpa-backend-route")?.value || "";

  const formData = new FormData();
  formData.append('action', 'ukpa_unified_save_calculator');
  formData.append('calculator_id', ukpaCalculatorId);
  formData.append('title', title);
  formData.append('backend_route', route);
  formData.append('elements', JSON.stringify(elements));
  formData.append('custom_css', document.getElementById('ukpa_custom_css')?.value || '');
  formData.append('custom_js', document.getElementById('ukpa_custom_js')?.value || '');
  formData.append('_wpnonce', ukpa_calc_data.nonce);

  fetch(ukpa_calc_data.ajaxurl, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    body: formData,
  })
    .then(res => res.text())
    .then(text => {
      console.log("Raw Response:", text);
      try {
        const data = JSON.parse(text);
        console.log("Parsed JSON:", data);
      } catch (e) {
        console.error("❌ Not JSON - likely an error page");
      }
    });
}
