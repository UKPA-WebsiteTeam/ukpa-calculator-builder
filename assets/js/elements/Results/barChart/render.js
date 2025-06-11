export default function renderBarChart(id, config, meta) {
  const key = config.resultDropdownKey || 'chart';
  return `
    <div class="ab-chart-wrapper" style="width: 100%; max-height: 250px;">
      <canvas id="${id}"
        class="ab-bar-chart"
        style="width: 100%; height: 100%; display: block;"
        data-result-key="${key}"></canvas>
    </div>
  `;
}
