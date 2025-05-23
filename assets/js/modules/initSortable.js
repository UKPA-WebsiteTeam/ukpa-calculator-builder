import { markAsDirty } from './markAsDirty.js';

export function initSortable(container) {
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
