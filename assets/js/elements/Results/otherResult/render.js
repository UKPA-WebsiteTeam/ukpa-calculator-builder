export default function renderOtherResult(id, config) {
  const key = config.dynamicResult || '';
  const layoutClass = config.layout === 'column' ? 'ab-other-block' : 'ab-other-inline';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';

  const style = `
    font-size: ${config.fontSize};
    background-color: ${config.backgroundColor};
    color: ${config.textColor};
  `;

  return `
    <div id="${id}" class="ab-other-result other-section ${layoutClass} ${config.cssClass || ''}"
         data-key="${key}" data-layout="${config.layout || 'row'}"
         style="${style}" ${tooltipAttr}
         data-id="${id}" data-name="${config.name || config.label || id}">
      <div class="ab-other-label">${config.label || 'Other Result'}</div>
      <div class="ab-other-value">${config.prefix || ''}--${config.suffix || ''}</div>
    </div>
  `;
}
