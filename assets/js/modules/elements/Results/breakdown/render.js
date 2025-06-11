export default function renderBreakdown(id, config) {
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const style = `font-size: ${config.fontSize};`;
  const resultKey = config.dynamicResult || 'breakdown';
  const showTotal = config.showTotal ? 'true' : 'false';

  return `
    <div id="${id}" class="ab-breakdown-wrapper ${config.cssClass || ''}"
         style="${style}" ${tooltipAttr}
         data-id="${id}" data-name="${config.name || config.label || id}">
      <label class="ab-breakdown-label">${config.label || 'Breakdown'}</label>
      <div class="ab-breakdown-table"
           data-result-key="${resultKey}"
           data-show-total="${showTotal}">
        <!-- Table rows inserted dynamically -->
      </div>
    </div>
  `;
}
