export default function renderMainResult(id, config) {
  const key = config.dynamicResult || '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const style = `font-size: ${config.fontSize}; text-align: ${config.textAlign};`;
  const prefix = config.prefix || '';
  const suffix = config.suffix || '';

  return `
    <div id="${id}" class="ab-main-result ${config.cssClass || ''}" style="${style}" ${tooltipAttr}
         data-id="${id}" data-name="${config.name || config.label || id}">
      <span class="ab-result-label">${config.label || 'Main Result'}</span>
      <div class="ab-main-result-value" data-key="${key}">${prefix}--${suffix}</div>
    </div>
  `;
}
