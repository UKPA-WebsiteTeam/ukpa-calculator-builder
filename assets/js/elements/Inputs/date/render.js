export default function renderDate(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <input type="date" id="${id}" class="ukpa-input" ${meta.dataAttr} ${meta.isCalcRequiredAttr} />
  `;
}
