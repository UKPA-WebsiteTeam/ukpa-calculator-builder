export default function renderDate(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <div class="abishek-DatePicker" style="position: relative;">
      <div class="ukpa-date-clickarea" style="padding: 8px; border: 1px solid #ccc; cursor: pointer;">
        <span class="ukpa-date-display ukpa-date-display-empty">
          ${config.placeholder || 'Month Date, Year'}
        </span>
      </div>
      <input
        type="text"
        id="${id}"
        name="${config.name || id}"
        class="ukpa-date-input"
        readonly
        ${meta.dataAttr}
        ${meta.isCalcRequiredAttr}
      />
    </div>
  `;
}
