export function saveCalculatorLayout() {
  const elements = [];

  document.querySelectorAll('.ukpa-drop-zone').forEach(sectionZone => {
    const section = sectionZone.dataset.section || 'unknown';

    // 1️⃣ Handle grouped elements in .element-container-ukpa
    sectionZone.querySelectorAll('.element-container-ukpa').forEach(container => {
      const groupId = container.dataset.containerId || `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      container.querySelectorAll('.ukpa-element').forEach(el => {
        const config = getLatestElementConfig(el);
        const htmlClone = el.cloneNode(true);
        const label = htmlClone.querySelector('.ukpa-admin-id-label');
        if (label) label.remove();

        elements.push({
          id: el.dataset.id,
          type: el.dataset.type,
          section: section,
          html: htmlClone.innerHTML,
          config: config,
          group: groupId
        });
      });
    });

    // 2️⃣ Handle standalone (non-container) elements like wrapper
    sectionZone.querySelectorAll('.ukpa-element:not(.element-container-ukpa *)').forEach(el => {
      const existing = elements.find(e => e.id === el.dataset.id);
      if (existing) return;

      const config = getLatestElementConfig(el);
      const htmlClone = el.cloneNode(true);
      const label = htmlClone.querySelector('.ukpa-admin-id-label');
      if (label) label.remove();

      elements.push({
        id: el.dataset.id,
        type: el.dataset.type,
        section: section,
        html: htmlClone.innerHTML,
        config: config,
        group: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    });
  });

  // 3️⃣ Fallback: Explicitly save the secondary-result-wrapper if still missing
  const existingWrapper = elements.find(e => e.id === 'secondary-result-wrapper');
  if (!existingWrapper) {
    const wrapper = document.querySelector('.ukpa-element[data-id="secondary-result-wrapper"]');
    if (wrapper) {
      const config = getLatestElementConfig(wrapper);
      const htmlClone = wrapper.cloneNode(true);
      const label = htmlClone.querySelector('.ukpa-admin-id-label');
      if (label) label.remove();

      elements.push({
        id: wrapper.dataset.id,
        type: wrapper.dataset.type,
        section: 'result', // or adjust if needed
        html: htmlClone.innerHTML,
        config: config,
        group: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    }
  }

  // ✅ Other settings
  const title = document.getElementById('ukpa-calc-title')?.value || 'Untitled Calculator';
  const route = document.getElementById('ukpa-backend-route')?.value || '';
  const custom_css = window.cssEditor ? window.cssEditor.getValue() : '';
  const custom_js = window.jsEditor ? window.jsEditor.getValue() : '';
  const dynamicKeys = window.dynamicResultKeys || [];
  const customTopHTML = document.getElementById('ukpa_custom_top_html')?.value || '';
  const customBottomHTML = document.getElementById('ukpa_custom_bottom_html')?.value || '';

  // ✅ FormData payload
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
        if (data.success || data.data?.message === 'No changes detected, but considered successful') {
          window.isDirty = false;
        } else {
          console.error("❌ Save failed:", data.data?.message || 'Unknown error');
        }
      } catch (e) {
        console.error("❌ Could not parse JSON:", e, text);
      }
    })
    .catch(err => {
      console.error("❌ Save request failed:", err);
    });
}

// 🧠 Helper to get latest config object from DOM
function getLatestElementConfig(el) {
  try {
    const raw = el.getAttribute('data-config');
    const config = raw ? JSON.parse(raw) : {};
    const liveLayoutMode = el.querySelector('select')?.value;
    if (el.dataset.type === 'wrapper' && el.dataset.id === 'secondary-result-wrapper' && liveLayoutMode) {
      config.layoutMode = liveLayoutMode; // 🔁 Sync real-time layout change
    }
    return config;
  } catch (e) {
    console.error("❌ Failed to parse config for element:", el, e);
    return {};
  }
}
