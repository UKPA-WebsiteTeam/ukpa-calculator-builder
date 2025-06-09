export function saveElementConfig({ el, type, id, config, editElementById }) {
  if (!el || !type || !id || !config || typeof editElementById !== 'function') {
    console.warn('Missing parameters in saveElementConfig');
    return;
  }

  // ✅ Set updated config
  el.setAttribute('data-config', JSON.stringify(config));

  // ✅ Update only internal content if not secondaryWrapper
  if (type !== 'secondaryWrapper') {
    const htmlEl = window.generateElementHTML(type, id, config);
    if (!htmlEl) return;

    el.innerHTML = '';
    el.appendChild(htmlEl);

    // ✅ ID label (skip for wrapper)
    if (id !== 'secondary-result-wrapper') {
      const idLabel = document.createElement('div');
      idLabel.className = 'ukpa-admin-id-label';
      idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
      el.insertBefore(idLabel, el.firstChild);
    }
  } else {
    // ✅ For secondaryWrapper: update .ukpa-drop-zone wrapper only
    const dropZone = el.querySelector('.ukpa-drop-zone');
    if (dropZone) {
      dropZone.dataset.allowed = "barChart,otherResult";
      dropZone.dataset.section = "results";
    }

    // Optional: update label if config.label exists
    const wrapperLabel = el.querySelector('.ukpa-editable-wrapper-label');
    if (wrapperLabel && config.label) {
      wrapperLabel.innerHTML = `🧩 <strong>${config.label}</strong>`;
    }

    // ❌ Do NOT clear el.innerHTML — preserve elements inside drop zone
  }

  // ✅ Always rebind click
  el.onclick = (e) => {
    e.stopPropagation();
    editElementById(id);
  };

  el.setAttribute('draggable', 'true');
}
