export default function renderDisclaimer(id, config, meta) {
  return `
    <div class="ab-disclaimer" ${meta.dataAttr}>
      <strong class="ab-disclaimer-label">${config.label || 'Disclaimer'}</strong>
      <p>${config.text || ''}</p>
    </div>`;
}
