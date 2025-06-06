export function saveElementConfig({ el, type, id, config, editElementById }) {
  if (!el || !type || !id || !config || typeof editElementById !== 'function') {
    console.warn('Missing parameters in saveElementConfig');
    return;
  }

  // ✅ Preserve children if this is the secondaryWrapper
  let preservedChildren = null;
  if (type === 'secondaryWrapper') {
    const existingDropZone = el.querySelector('.ukpa-drop-zone');
    preservedChildren = existingDropZone?.innerHTML;
  }

  // ✅ Update data-config
  el.setAttribute('data-config', JSON.stringify(config));

  // ✅ Generate updated content HTML
  const htmlEl = window.generateElementHTML(type, id, config);
  if (!htmlEl) return;

  // ✅ Clear and re-render
  el.innerHTML = '';
  el.appendChild(htmlEl);

  // ✅ Add back ID label
  const idLabel = document.createElement('div');
  idLabel.className = 'ukpa-admin-id-label';
  idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
  el.insertBefore(idLabel, el.firstChild);

  // ✅ Restore children for secondaryWrapper
  if (type === 'secondaryWrapper') {
    const newDropZone = el.querySelector('.ukpa-drop-zone');
    if (newDropZone && preservedChildren) {
      newDropZone.innerHTML = preservedChildren;
    }
  }

  // ✅ Rebind interactivity on outer element (not just inner)
  el.onclick = (e) => {
    e.stopPropagation();
    editElementById(id);
  };

  el.setAttribute('draggable', 'true');
}
