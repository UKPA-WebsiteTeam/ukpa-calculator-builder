export function waitForEl(selector, callback) {
  const el = document.querySelector(selector);
  if (el) return callback(el);
  const observer = new MutationObserver(() => {
    const elNow = document.querySelector(selector);
    if (elNow) {
      observer.disconnect();
      callback(elNow);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
