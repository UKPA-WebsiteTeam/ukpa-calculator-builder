export function enableColumnResizing() {
  document.querySelectorAll('.ukpa-resize-handle').forEach(handle => {
    let isDragging = false;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;

      const container = handle.parentElement;
      const leftCol = handle.previousElementSibling;
      const rightCol = handle.nextElementSibling;

      const startX = e.clientX;
      const containerWidth = container.offsetWidth;
      const startLeftWidth = leftCol.offsetWidth;

      function onMouseMove(e) {
        if (!isDragging) return;
        const delta = e.clientX - startX;
        const newLeftPercent = ((startLeftWidth + delta) / containerWidth) * 100;
        const clampedLeft = Math.max(20, Math.min(80, newLeftPercent)); // clamp between 20% and 80%
        leftCol.style.flex = `0 0 ${clampedLeft}%`;
        rightCol.style.flex = `0 0 ${100 - clampedLeft}%`;
      }

      function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}
