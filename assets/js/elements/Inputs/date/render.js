export default function renderDate(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <div class="abishek-DatePicker" style="position: relative;">
      <div class="ukpa-date-clickarea" style="padding: 8px; border: 1px solid #ccc; cursor: pointer;">
        <span class="ukpa-date-display${config.value ? '' : ' ukpa-date-display-empty'}">
          ${config.value
            ? (new Date(config.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
            : (config.placeholder || 'Month Date, Year')}
        </span>
      </div>
      <input
        type="text"
        id="${id}"
        name="${config.name || id}"
        class="ukpa-date-input"
        value="${config.value || ''}"
        readonly
        ${meta.dataAttr}
        ${meta.isCalcRequiredAttr}
      />
    </div>
  `;
}
