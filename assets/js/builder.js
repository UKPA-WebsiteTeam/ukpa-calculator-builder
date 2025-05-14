import('./builder-edit.js').then(mod => {
  window.editElementById = mod.editElementById;
});
import('./element-definitions.js').then(mod => {
  window.ukpaElementDefinitions = mod.ukpaElementDefinitions;
});
import('./element-renderer.js').then(mod => {
  window.generateElementHTML = mod.generateElementHTML;
});

let elementCounter = 0;
let draggingElement = null;
let isDirty = false;

function markAsDirty() {
  isDirty = true;
}

function addElementToBuilder(type, config = null, id = null, sectionOverride = null) {
  const def = window.ukpaElementDefinitions?.[type];
  if (!def) return;

  const generateUniqueElementId = (type) =>
    `wise-${type}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;

  // ✅ generate ID only after `type` is confirmed
  const finalId = id || generateUniqueElementId(type);

  const finalConfig = config || structuredClone(def.default);
  const html = window.generateElementHTML(type, finalId, finalConfig);

  const el = document.createElement('div');
  el.classList.add('ukpa-element');
  el.setAttribute('draggable', 'true');
  el.setAttribute('data-type', type);
  el.setAttribute('data-id', finalId);
  el.setAttribute('data-config', JSON.stringify(finalConfig));
  el.innerHTML = `<div class="ukpa-admin-id-label">🆔 <strong>${finalId}</strong></div>` + html;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    window.editElementById(finalId);
  });

  el.addEventListener("dragstart", (e) => {
    draggingElement = el;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", finalId);
  });

  const section = sectionOverride ||
    (['mainResult', 'breakdown'].includes(type) ? 'results' :
     type === 'disclaimer' ? 'disclaimer' :
     ['contentBlock', 'header', 'textBlock', 'image', 'video', 'button', 'link'].includes(type) ? 'content' : 'inputs');

  const container = document.querySelector(`#${section}-preview`);
  if (container) {
    container.appendChild(el);
    initSortable(container);
    markAsDirty();
  }
}

function initSortable(container) {
  const children = container.querySelectorAll('.ukpa-element');

  children.forEach(child => {
    child.addEventListener('dragover', e => {
      e.preventDefault();
      const bounding = child.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      child.style.borderTop = offset < bounding.height / 2 ? '2px solid #007cba' : '';
      child.style.borderBottom = offset >= bounding.height / 2 ? '2px solid #007cba' : '';
    });

    child.addEventListener('dragleave', () => {
      child.style.borderTop = '';
      child.style.borderBottom = '';
    });

    child.addEventListener('drop', (e) => {
      e.preventDefault();
      const bounding = child.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      const parent = child.parentNode;

      if (draggingElement && parent && draggingElement !== child) {
        if (offset < bounding.height / 2) {
          parent.insertBefore(draggingElement, child);
        } else {
          parent.insertBefore(draggingElement, child.nextSibling);
        }
        markAsDirty();
      }

      child.style.borderTop = '';
      child.style.borderBottom = '';
    });
  });
}



function saveCalculatorLayout() {
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
  formData.append('_wpnonce', ukpa_calc_data.nonce); // ✅


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



document.addEventListener('DOMContentLoaded', () => {
  window.ukpaCalculatorId = new URLSearchParams(window.location.search).get('calc_id');

  
document.querySelectorAll('.ukpa-element').forEach(el => {
  const id = el.dataset.id;
  el.setAttribute('draggable', 'true');

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    window.editElementById(id);
  });

  el.addEventListener("dragstart", (e) => {
    draggingElement = el;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  });

  const container = el.closest('.ukpa-drop-zone');
  if (container) initSortable(container);
});


  document.querySelectorAll('.ukpa-toolbox .draggable').forEach(item => {
    if (!item.dataset.bound) {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('ukpa-drag-type', item.dataset.type);
        e.dataTransfer.setData('source', 'toolbox');
      });
      item.dataset.bound = 'true';
    }
  });

  document.querySelectorAll('.ukpa-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());

    zone.addEventListener('drop', e => {
      e.preventDefault();
      const type = e.dataTransfer.getData('ukpa-drag-type');
      const source = e.dataTransfer.getData('source');
      if (source === 'toolbox') {
        addElementToBuilder(type, null, null, zone.dataset.section);
      }
    });

    initSortable(zone);
  });

  document.getElementById('ukpa-save-builder')?.addEventListener('click', saveCalculatorLayout);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveCalculatorLayout();
    }
  });

  // Exit warning for unsaved changes
  const exitBtn = document.querySelector(".ukpa-builder-exit");
  if (exitBtn) {
    exitBtn.addEventListener("click", function (e) {
      if (isDirty) {
        const confirmed = confirm("⚠️ You have unsaved changes. Are you sure you want to exit?");
        if (!confirmed) e.preventDefault();
      }
    });
  }
});

window.toggleBox = function (id) {
  const body = document.getElementById(id);
  if (!body) return;
  const icon = body.previousElementSibling?.querySelector('.toggle-indicator');
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  if (icon) icon.textContent = isHidden ? '↰' : '⇩';
};
