export default function renderMainResult(id, config, meta) {
  const key = config.dynamicResult || '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';

  return `
    <div class="ab-main-result" ${meta.dataAttr} ${meta.isCalcRequiredAttr} ${tooltipAttr}>
      <span class="ab-result-label">${config.label || 'Main Result'} ${meta.requiredMark || ''}</span>
      <div class="ab-main-result-value" data-key="${key}">--</div>
    </div>
  `;
}
