export default function renderDropdown(id, config, meta) {
  const optionsHTML = (config.options || []).map(opt => {
    const label = typeof opt === 'object' ? opt.label : opt;
    const value = typeof opt === 'object' ? opt.value : opt;
    const selected = config.value === value || config.dynamicResult === value ? 'selected' : '';
    return `<option value="${value}" ${selected}>${label}</option>`;
  }).join('');

  const disabledAttr = config.disabled ? 'disabled' : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const cssClass = config.cssClass || '';

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <select
      id="${id}"
      class="ukpa-input ${cssClass}"
      placeholder="${config.placeholder || ''}"
      ${meta.dataAttr}
      ${meta.isCalcRequiredAttr}
      ${tooltipAttr}
      ${disabledAttr}
    >
      ${optionsHTML}
    </select>
  `;
}
