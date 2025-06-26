export default function renderBarChart(id, config, meta) {
  const key = config.resultDropdownKey || 'chart';
  const height = config.chartHeight || '250px';
  const width = config.chartWidth || '100%';

  return `
    <div class="ab-chart-wrapper" style="width: ${width}; max-height: ${height};">
      <canvas id="${id}"
        class="ab-bar-chart"
        style="width: 100%; height: 100%; display: block;"
        data-result-key="${key}"></canvas>
    </div>
  `;
}
