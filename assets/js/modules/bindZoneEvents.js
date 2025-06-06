import { handleDrop } from './handleDrop.js';

export function bindZoneEvents(zone) {
  const allowedTypes = (zone.dataset.allowed || '').split(',').map(t => t.trim()).filter(Boolean);

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    const draggedType = window.draggingElement?.dataset.type;

    if (allowedTypes.length && !allowedTypes.includes(draggedType)) {
      zone.style.border = '2px dashed red';
      return;
    } else {
      zone.style.border = '';
    }

    const target = e.target.closest('.ukpa-element') || zone;
    document.querySelectorAll('.ukpa-element').forEach(el =>
      el.classList.remove('hover-top', 'hover-bottom', 'hover-left', 'hover-right')
    );

    if (target.classList.contains('ukpa-element')) {
      const rect = target.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      if (offsetY < rect.height / 4) target.classList.add('hover-top');
      else if (offsetY > rect.height * 3 / 4) target.classList.add('hover-bottom');
      else if (offsetX < rect.width / 2) target.classList.add('hover-left');
      else target.classList.add('hover-right');
    }
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    const dragged = document.querySelector('.dragging');
    if (!dragged) return;

    const type = dragged.dataset.type;
    if (allowedTypes.length && !allowedTypes.includes(type)) {
      alert(`❌ You can only drop: ${allowedTypes.join(', ')}`);
      return;
    }

    let target = e.target.closest('.ukpa-element');
    const rect = target?.getBoundingClientRect();
    const offsetX = e.clientX - (rect?.left ?? 0);
    const offsetY = e.clientY - (rect?.top ?? 0);

    let direction = 'bottom';
    if (offsetY < (rect?.height ?? 0) / 4) direction = 'top';
    else if (offsetY > (rect?.height ?? 0) * 3 / 4) direction = 'bottom';
    else if (offsetX < (rect?.width ?? 0) / 2) direction = 'left';
    else direction = 'right';

    if (!target) {
      target = zone.querySelector('.ukpa-row') || zone;
      console.log("📥 Dropping into empty zone");
      handleDrop(dragged, target, 'bottom');
    } else {
      handleDrop(dragged, target, direction);
    }

    document.querySelectorAll('.ukpa-element').forEach(el =>
      el.classList.remove('hover-top', 'hover-bottom', 'hover-left', 'hover-right')
    );
  });
}
