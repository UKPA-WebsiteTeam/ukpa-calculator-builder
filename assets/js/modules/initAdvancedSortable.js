import { handleDrop } from './handleDrop.js';

export function initAdvancedSortable() {
  const dropZones = document.querySelectorAll('.ukpa-drop-zone');

  dropZones.forEach(dropZone => {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('ukpa-drop-active');

      clearHoverClasses();

      const targetRow = e.target.closest('.ukpa-row');
      const targetCol = e.target.closest('.ukpa-column');

      if (targetCol) {
        // Hovering inside a column → handle left/right
        const rect = targetCol.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const direction = offsetX < rect.width / 2 ? 'left' : 'right';
        targetCol.classList.add(`ukpa-hover-${direction}`);
      } else if (targetRow) {
        // Hovering over a row (not over a specific column) → handle top/bottom
        const rect = targetRow.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const direction = offsetY < rect.height / 2 ? 'top' : 'bottom';
        targetRow.classList.add(`ukpa-hover-${direction}`);
      }
    });





    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('ukpa-drop-active');
      clearHoverClasses();
    });

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('ukpa-drop-active');

      const dragged = window.draggingElement;
      if (!dragged) {
        console.warn("❌ No draggingElement set.");
        return;
      }

      const targetEl = e.target.closest('.ukpa-column, .ukpa-row, .ukpa-element') || dropZone;
      clearHoverClasses();

      // Determine direction for insert
      let direction = 'bottom';
      if (targetEl && targetEl !== dropZone) {
        const rect = targetEl.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const offsetX = e.clientX - rect.left;

        const isVertical = rect.height > rect.width;
        direction = isVertical
          ? (offsetY < rect.height / 2 ? 'top' : 'bottom')
          : (offsetX < rect.width / 2 ? 'left' : 'right');
      }

      if (dragged.source === 'toolbox') {
        handleDrop({ source: 'toolbox', type: dragged.type }, targetEl, direction);
      } else {
        handleDrop(dragged, targetEl, direction);
      }

      // Rebind interactivity after drop
      dropZone.querySelectorAll('.ukpa-element').forEach(el => {
        bindInteractivity(el);
      });
    });
  });

  // Toolbox drag
  const toolboxItems = document.querySelectorAll('.ukpa-toolbox .draggable');
  toolboxItems.forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', () => {
      window.draggingElement = {
        source: 'toolbox',
        type: item.dataset.type
      };
    });
    item.addEventListener('dragend', () => {
      window.draggingElement = null;
    });
  });

  // Rebind existing elements
  document.querySelectorAll('.ukpa-element').forEach(el => {
    bindInteractivity(el);
  });

  console.log('✅ Advanced sortable initialized.');
}

function bindInteractivity(el, id = null) {
  if (!el || !el.classList.contains('ukpa-element')) return;

  const elementId = id || el.dataset.id;
  const type = el.dataset.type;

  if (type === 'wrapper' && elementId === 'secondary-result-wrapper') {
    el.removeAttribute('draggable');
  } else {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      el.classList.add("dragging");
      window.draggingElement = el;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", elementId);
    });

    el.addEventListener('dragend', () => {
      el.classList.remove("dragging");
      window.draggingElement = null;
    });
  }

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    window.editElementById?.(elementId);
  });
}

function clearHoverClasses() {
  document.querySelectorAll('.ukpa-hover-top, .ukpa-hover-bottom, .ukpa-hover-left, .ukpa-hover-right')
    .forEach(el => el.classList.remove(
      'ukpa-hover-top',
      'ukpa-hover-bottom',
      'ukpa-hover-left',
      'ukpa-hover-right'
    ));
}
