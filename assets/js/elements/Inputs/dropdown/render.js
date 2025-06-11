export default function renderDropdown(id, config, meta) {
  const options = (config.options || []).map(opt => {
    return `<option value="${opt.value}">${opt.label}</option>`;
  }).join('');

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <select id="${id}" ${meta.dataAttr} ${meta.isCalcRequiredAttr} class="ukpa-input">
      ${options}
    </select>
  `;
}
