export default function renderCheckbox(id, config, meta) {
  return `
    <label>
      <input type="checkbox" id="${id}" ${meta.dataAttr} ${meta.isCalcRequiredAttr} class="ukpa-input" />
      ${config.label || ''} ${meta.requiredMark || ''}
    </label>
  `;
}
