import { markAsDirty } from './markAsDirty.js';
import { initSortable } from './initSortable.js';

export function addElementToBuilder(type, config = null, id = null, sectionOverride = null) {
  const def = window.ukpaElementDefinitions?.[type];
  if (!def) return;

  const generateUniqueElementId = (type) =>
    `wise-${type}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;
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
    window.draggingElement = el;
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
