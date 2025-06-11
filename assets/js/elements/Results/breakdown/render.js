export default function renderBreakdown(id, config, meta) {
  return `
    <div class="ab-breakdown-wrapper">
      <label class="ab-breakdown-label">${config.label || 'Breakdown'}</label>
      <div id="${id}" class="ab-breakdown-table" data-result-key="${config.resultDropdownKey || 'breakdown'}">
        <!-- Result rows will be inserted dynamically -->
      </div>
    </div>
  `;
}
