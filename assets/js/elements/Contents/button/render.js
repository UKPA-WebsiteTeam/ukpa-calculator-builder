export default function renderButton(id, config, meta) {
  return `
    <button type="${config.action || 'submit'}" id="${id}" name="${config.name || id}" class="ukpa-button">
      ${config.label || 'Submit'}
    </button>
  `;
}
