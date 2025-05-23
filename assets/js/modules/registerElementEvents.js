import { initSortable } from './initSortable.js';
import { addElementToBuilder } from './addElementToBuilder.js';

export function registerElementEvents() {
  // Make existing preview elements draggable and clickable
  document.querySelectorAll('.ukpa-element').forEach(el => {
    const id = el.dataset.id;
    el.setAttribute('draggable', 'true');

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.editElementById) {
        window.editElementById(id);
      }
    });

    el.addEventListener("dragstart", (e) => {
      window.draggingElement = el;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    });

    const container = el.closest('.ukpa-drop-zone');
    if (container) initSortable(container);
  });

  // Bind toolbox item drag events
  document.querySelectorAll('.ukpa-toolbox .draggable').forEach(item => {
    if (!item.dataset.bound) {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('ukpa-drag-type', item.dataset.type);
        e.dataTransfer.setData('source', 'toolbox');
      });
      item.dataset.bound = 'true'; // prevent double binding
    }
  });

  // Drop zones handle incoming elements
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
}
