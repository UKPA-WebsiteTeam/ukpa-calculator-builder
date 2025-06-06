import { markAsDirty } from './markAsDirty.js';
import { saveCalculatorLayout } from './saveCalculatorLayout.js';
import { removeEmptyColumnsAndRows } from './cleanup.js';

export function handleDrop(dragged, target, direction) {
  const isFromToolbox = dragged?.source === 'toolbox';
  const type = dragged?.type || dragged?.dataset?.type;

  if (!type) {
    console.error("❌ Dropped element is missing data-type.");
    return;
  }

  // 🚫 Prevent dropping wrappers (static containers)
  if (type === 'wrapper') {
    console.warn("🚫 Cannot drag/drop wrapper element.");
    return;
  }

  // ✅ Locate proper drop zone
  let dropZone = target.closest('.ukpa-drop-zone');

  // ✅ Redirect barChart/otherResult into proper secondary zone
  if (
    ['barChart', 'otherResult'].includes(type) &&
    (!dropZone || dropZone.id !== 'secondary-result-zone')
  ) {
    const wrapper = document.querySelector('[data-id="secondary-result-wrapper"]');
    dropZone = wrapper?.querySelector('#secondary-result-zone');
    target = dropZone?.querySelector('.element-container-ukpa:last-child') || dropZone;
  }

  // 🚫 Block if invalid or missing drop zone
  if (!dropZone || !(dropZone instanceof HTMLElement)) {
    console.warn("❌ Invalid drop zone:", dropZone);
    return;
  }

  // ✅ Check allowed types
  const allowedTypes = dropZone?.dataset.allowed?.split(',').map(s => s.trim()) || [];
  if (allowedTypes.length && !allowedTypes.includes(type)) {
    console.warn(`🚫 Dropped element type "${type}" not allowed in this section.`);
    return;
  }

  const containerId = `cont-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // ✅ Build the new element
  let newElement;
  if (isFromToolbox) {
    const newId = `wise-${type}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;
    const config = structuredClone(window.ukpaElementDefinitions?.[type]?.default || {});

    const el = document.createElement('div');
    el.classList.add('ukpa-element');
    el.setAttribute('draggable', 'true');
    el.setAttribute('data-type', type);
    el.setAttribute('data-id', newId);
    el.setAttribute('data-config', JSON.stringify(config));
    el.innerHTML = `<div class="ukpa-admin-id-label">🆔 <strong>${newId}</strong></div>`;

    const htmlOutput = window.generateElementHTML(type, newId, config);
    if (htmlOutput instanceof HTMLElement) {
      el.appendChild(htmlOutput);
    } else {
      el.innerHTML += htmlOutput;
    }

    newElement = el;
  } else {
    const original = dragged.closest('.ukpa-element');
    if (!original) return;
    newElement = original.cloneNode(true);
    setTimeout(() => original.remove(), 10);
  }

  const targetElement = target.closest('.ukpa-element');
  const targetContainer = target.closest('.element-container-ukpa');

  // ✅ If no existing elements in zone (empty), just add new container
  if (!targetElement || !targetContainer) {
    const newContainer = document.createElement('div');
    newContainer.classList.add('element-container-ukpa');
    newContainer.dataset.containerId = containerId;
    newContainer.appendChild(newElement);
    dropZone.appendChild(newContainer);
    markAsDirty();
    saveCalculatorLayout();
    return;
  }

  // ⬆⬇ Drop ABOVE or BELOW = Create a new container
  if (direction === 'top' || direction === 'bottom') {
    const newContainer = document.createElement('div');
    newContainer.classList.add('element-container-ukpa');
    newContainer.dataset.containerId = containerId;
    newContainer.appendChild(newElement);

    direction === 'top'
      ? dropZone.insertBefore(newContainer, targetContainer)
      : dropZone.insertBefore(newContainer, targetContainer.nextSibling);

    markAsDirty();
    saveCalculatorLayout();
    return;
  }

  // ⬅➡ Drop LEFT or RIGHT = Insert into same container
  if (direction === 'left' || direction === 'right') {
    const siblings = [...targetContainer.children];
    const targetIndex = siblings.findIndex(el => el === targetElement);

    if (direction === 'left') {
      targetContainer.insertBefore(newElement, targetElement);
    } else {
      targetContainer.insertBefore(newElement, targetElement.nextSibling);
    }

    markAsDirty();
    saveCalculatorLayout();
    return;
  }

  // 🔁 Fallback: Drop at end in new container
  const fallback = document.createElement('div');
  fallback.classList.add('element-container-ukpa');
  fallback.dataset.containerId = containerId;
  fallback.appendChild(newElement);
  dropZone.appendChild(fallback);

  markAsDirty();
  saveCalculatorLayout();

  setTimeout(() => removeEmptyColumnsAndRows(dropZone), 100);
}
