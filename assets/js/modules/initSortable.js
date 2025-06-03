import { markAsDirty } from './markAsDirty.js';

export function initSortable(container = document) {
  if (!container || typeof container.querySelectorAll !== 'function') {
    console.warn("❌ initSortable: container is invalid or undefined");
    return;
  }

  const children = container.querySelectorAll('.ukpa-element');
  if (!children.length) {
    console.info("ℹ️ initSortable: no .ukpa-element nodes found");
    return;
  }

  children.forEach(child => {
    child.setAttribute('draggable', 'true');

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

    child.addEventListener('drop', e => {
      e.preventDefault();
      const bounding = child.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      const parent = child.parentNode;

      if (window.draggingElement && parent && window.draggingElement !== child) {
        if (offset < bounding.height / 2) {
          parent.insertBefore(window.draggingElement, child);
        } else {
          parent.insertBefore(window.draggingElement, child.nextSibling);
        }
        markAsDirty();
      }

      child.style.borderTop = '';
      child.style.borderBottom = '';
    });
  });
}
