export default function renderDateLegacy(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <input
      type="date"
      id="${id}"
      name="${config.name || id}"
      placeholder="${config.placeholder || ''}"
      class="ukpa-date-input-native"
      value="${config.value || ''}"
      ${meta.dataAttr}
      ${meta.isCalcRequiredAttr}
    />
  `;
}
