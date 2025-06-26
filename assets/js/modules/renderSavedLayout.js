export function renderSavedLayout(elements = []) {
  if (!Array.isArray(elements)) return;

  const sectioned = {};

  // Group containers by section
  elements.forEach(item => {
    const section = item.section || 'unknown';
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(item);
  });

  // Render each section
  Object.entries(sectioned).forEach(([sectionId, containers]) => {
    const zone = document.querySelector(`.ukpa-drop-zone[data-section="${sectionId}"]`);
    if (!zone) return;

    zone.innerHTML = ''; // Clear zone

    containers.forEach(container => {
      if (!Array.isArray(container.children) || container.children.length === 0) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'element-container-ukpa';

      container.children.forEach(el => {
        const elDiv = document.createElement('div');
        elDiv.classList.add('ukpa-element');
        elDiv.setAttribute('draggable', 'true');
        elDiv.setAttribute('data-id', el.id);
        elDiv.setAttribute('data-type', el.type);
        elDiv.setAttribute('data-config', JSON.stringify(el.config || {}));

        elDiv.innerHTML = `<div class="ukpa-admin-id-label">🆔 <strong>${el.id}</strong></div>`;

        const html = window.generateElementHTML(el.type, el.id, el.config || {});
          if (html instanceof HTMLElement) {
            elDiv.appendChild(html);
          } else {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            elDiv.appendChild(wrapper.firstElementChild);
          }


        wrapper.appendChild(elDiv);
      });

      zone.appendChild(wrapper);
    });
  });
}
