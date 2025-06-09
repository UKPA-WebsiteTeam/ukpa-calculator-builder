import { initAdvancedSortable } from './initAdvancedSortable.js';

export function saveElementConfig({ el, type, id, config, editElementById }) {
  if (!el || !type || !id || !config || typeof editElementById !== 'function') {
    console.warn('Missing parameters in saveElementConfig');
    return;
  }

  // ✅ Set updated config on the wrapper element
  el.setAttribute('data-config', JSON.stringify(config));

  // ✅ Standard update for all non-secondaryWrapper elements
  if (type !== 'secondaryWrapper') {
    const htmlEl = window.generateElementHTML(type, id, config);
    if (!htmlEl) return;

    el.innerHTML = '';
    el.appendChild(htmlEl);

    // ✅ Add ID label (except for secondary wrapper)
    if (id !== 'secondary-result-wrapper') {
      const idLabel = document.createElement('div');
      idLabel.className = 'ukpa-admin-id-label';
      idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
      el.insertBefore(idLabel, el.firstChild);
    }
  } else {
    // ✅ For secondary-wrapper: update drop zone attributes, preserve children
    const existingDropZone = el.querySelector('.ukpa-drop-zone');
    if (existingDropZone) {
      existingDropZone.dataset.allowed = "barChart,otherResult";
      existingDropZone.dataset.section = "results";

      // 🔁 Rebind events on each child inside drop zone
      existingDropZone.querySelectorAll('.ukpa-element').forEach(child => {
        const childId = child.dataset.id;
        if (childId) {
          child.onclick = (e) => {
            e.stopPropagation();
            editElementById(childId);
          };
          child.setAttribute('draggable', 'true');
        }
      });
    }

    // ✅ Update wrapper label if changed
    const wrapperLabel = el.querySelector('.ukpa-editable-wrapper-label');
    if (wrapperLabel && config.label) {
      wrapperLabel.innerHTML = `🧩 <strong>${config.label}</strong>`;
    }

    // ✅ Re-initialize drag and drop logic
    initAdvancedSortable();
  }

  // ✅ Always rebind the main element's edit handler
  el.onclick = (e) => {
    e.stopPropagation();
    editElementById(id);
  };

  el.setAttribute('draggable', 'true');
}
