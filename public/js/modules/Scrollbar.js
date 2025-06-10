export function scrollBar() {
  const scrollBox = document.querySelector('.ab-input-scrollable');
  if (!scrollBox) return;

  if (scrollBox.scrollHeight > scrollBox.clientHeight) {
    scrollBox.classList.add('has-scroll');
  } else {
    scrollBox.classList.remove('has-scroll');
  }
}

// ✅ Ensure passive support for resize listener
const supportsPassive = (() => {
  let supported = false;
  try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: () => supported = true
    }));
  } catch (e) {}
  return supported;
})();

document.addEventListener("DOMContentLoaded", () => {
  scrollBar();

  // Recheck after dynamic rendering
  setTimeout(scrollBar, 300);

  // ✅ Safe resize listener
  window.addEventListener('resize', scrollBar, supportsPassive ? { passive: true } : false);
});
