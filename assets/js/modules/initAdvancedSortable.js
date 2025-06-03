import { handleDrop } from './handleDrop.js';

export function initAdvancedSortable() {
  const dropZones = document.querySelectorAll('.ukpa-drop-zone');

  // ✅ Bind drag events to toolbox elements
  document.querySelectorAll('.draggable').forEach(el => {
    el.setAttribute('draggable', 'true');

    el.addEventListener('dragstart', e => {
      el.classList.add('dragging');
      window.draggingElement = el;

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", el.dataset.type);

      console.log(`🟢 Drag started from toolbox: <${el.dataset.type}>`);
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      window.draggingElement = null;
      document.querySelectorAll('.ukpa-element').forEach(el =>
        el.classList.remove('hover-top', 'hover-bottom', 'hover-left', 'hover-right')
      );
      console.log("🛑 Drag ended");
    });
  });

  // ✅ Setup drop zones
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();

      const target = e.target.closest('.ukpa-element') || zone;

      document.querySelectorAll('.ukpa-element').forEach(el =>
        el.classList.remove('hover-top', 'hover-bottom', 'hover-left', 'hover-right')
      );

      if (target.classList.contains('ukpa-element')) {
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        if (offsetY < rect.height / 4) {
          target.classList.add('hover-top');
        } else if (offsetY > rect.height * 3 / 4) {
          target.classList.add('hover-bottom');
        } else if (offsetX < rect.width / 2) {
          target.classList.add('hover-left');
        } else {
          target.classList.add('hover-right');
        }
      }
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      const dragged = document.querySelector('.dragging');
      const target = e.target.closest('.ukpa-element');

      if (!dragged) {
        console.warn("🚫 Drop failed: no element being dragged.");
        return;
      }

      const fallbackRow = zone.querySelector('.ukpa-row');
      if (!target) {
        if (fallbackRow) {
          console.log("⬇️ Dropping into empty zone (bottom)");
          handleDrop(dragged, fallbackRow, 'bottom');
        } else {
          console.warn("⚠️ No fallback .ukpa-row inside this zone");
        }
        return;
      }

      const rect = target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      let direction = 'bottom';
      if (offsetY < rect.height / 4) {
        direction = 'top';
      } else if (offsetY > rect.height * 3 / 4) {
        direction = 'bottom';
      } else if (offsetX < rect.width / 2) {
        direction = 'left';
      } else {
        direction = 'right';
      }

      console.log(`📥 Dropping <${dragged.dataset.type}> ${direction} of <${target.dataset.id}>`);
      document.querySelectorAll('.ukpa-element').forEach(el =>
        el.classList.remove('hover-top', 'hover-bottom', 'hover-left', 'hover-right')
      );

      handleDrop(dragged, target, direction);
    });
  });

  // ✅ Global dragover to allow drop
  document.addEventListener('dragover', e => {
    e.preventDefault();
  }, { passive: false });
}
