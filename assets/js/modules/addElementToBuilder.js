import { markAsDirty } from './markAsDirty.js';
import { initAdvancedSortable} from './initAdvancedSortable.js';


export function addElementToBuilder(type, config = null, id = null, sectionOverride = null) {
  const def = window.ukpaElementDefinitions?.[type];
  if (!def) return;

  const generateUniqueElementId = (type) =>
    `wise-${type}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;
  const finalId = id || generateUniqueElementId(type);
  const finalConfig = config || structuredClone(def.default);

  const htmlEl = window.generateElementHTML(type, finalId, finalConfig); // ✅ real DOM

  const el = document.createElement('div');
  el.classList.add('ukpa-element');
  el.setAttribute('draggable', 'true');
  el.setAttribute('data-type', type);
  el.setAttribute('data-id', finalId);
  el.setAttribute('data-config', JSON.stringify(finalConfig));

  // ✅ Add ID label first
  const idLabel = document.createElement('div');
  idLabel.className = 'ukpa-admin-id-label';
  idLabel.innerHTML = `🆔 <strong>${finalId}</strong>`;
  el.appendChild(idLabel);

  // ✅ Append the DOM node safely
  el.appendChild(htmlEl);

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
    initAdvancedSortable();
    markAsDirty();
  }
}
