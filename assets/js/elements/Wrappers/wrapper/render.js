export default function renderWrapper(id, config) {
  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('ukpa-element');
  wrapperEl.setAttribute('data-id', id);
  wrapperEl.setAttribute('data-type', 'wrapper');
  wrapperEl.setAttribute('data-config', JSON.stringify(config));
  wrapperEl.setAttribute('draggable', 'true');

  const layoutMode = config.layoutMode || 'full';
  const layoutClass = layoutMode === 'stacked'
    ? 'ukpa-secondary-layout-stacked'
    : 'ukpa-secondary-layout-full';

  wrapperEl.innerHTML = `
    <div class="ukpa-admin-id-label ukpa-editable-wrapper-label">
      🧩 <strong>${config.label || 'Secondary Result Wrapper'}</strong>
    </div>
    <div class="ukpa-drop-zone"
        id="secondary-result-zone"
        data-allowed="barChart,otherResult"
        data-section="results">
      <h4>Other Results & Charts</h4>
      <div class="element-container-ukpa ${layoutClass}"></div>
    </div>
  `;

  const oldDropZone = document.querySelector(`[data-id="${id}"] .ukpa-drop-zone`);
  const newContainer = wrapperEl.querySelector('.element-container-ukpa');

  if (oldDropZone && newContainer) {
    const oldContainer = oldDropZone.querySelector('.element-container-ukpa') || oldDropZone;
    Array.from(oldContainer.children).forEach(child => {
      if (child.classList.contains('ukpa-element')) {
        const cloned = child.cloneNode(true);
        cloned.setAttribute('draggable', 'true');
        newContainer.appendChild(cloned);
      }
    });
  }

  return wrapperEl;
}
