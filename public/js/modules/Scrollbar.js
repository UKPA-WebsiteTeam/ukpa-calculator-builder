export function scrollBar() {
  const scrollBox = document.querySelector('.ab-input-scrollable');
  if (!scrollBox) return;

  if (scrollBox.scrollHeight > scrollBox.clientHeight) {
    scrollBox.classList.add('has-scroll');
  } else {
    scrollBox.classList.remove('has-scroll');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  scrollBar();

  // Optionally re-check after input rendering
  setTimeout(scrollBar, 300);
  window.addEventListener('resize', scrollBar);
});
