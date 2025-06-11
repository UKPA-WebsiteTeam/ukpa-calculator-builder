export default function renderBarChart(id, config) {
  const style = `
    width: 100%;
    height: ${config.chartHeight || '250px'};
    margin-top: ${config.marginTop};
    margin-bottom: ${config.marginBottom};
  `;
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const resultKey = config.dynamicResult || 'breakdown';

  return `
    <div class="ab-chart-wrapper ${config.cssClass || ''}" style="${style}" ${tooltipAttr}
         data-id="${id}" data-name="${config.name || config.label || id}">
      <canvas id="${id}"
              class="ab-bar-chart"
              style="width: 100%; height: 100%; display: block;"
              data-result-key="${resultKey}"></canvas>
    </div>
  `;
}
