export default function renderDropdown(id, config, meta) {
  const customClass = config.customClass || '';  // ✅ define it
  const widthStyle = config.width ? `style="width: ${config.width};"` : '';

  const options = (config.options || []).map(opt => {
    return `<option value="${opt.value}">${opt.label}</option>`;
  }).join('');

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark || ''}</label>
    <select id="${id}" ${meta.dataAttr} ${meta.isCalcRequiredAttr} class="ukpa-input ${customClass}" ${widthStyle}>
      ${options}
    </select>
  `;
}
