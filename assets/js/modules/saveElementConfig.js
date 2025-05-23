export function saveElementConfig({ el, type, id, config, editElementById }) {
  if (!el || !type || !id || !config || typeof editElementById !== 'function') {
    console.warn('Missing parameters in saveElementConfig');
    return;
  }

  el.setAttribute('data-config', JSON.stringify(config));
  el.innerHTML = window.generateElementHTML(type, id, config);

  el.addEventListener('click', () => editElementById(id));
}
