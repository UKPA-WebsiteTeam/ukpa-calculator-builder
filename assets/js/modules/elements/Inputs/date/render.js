export default function renderDate(id, config) {
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';
  const disabledAttr = config.disabled ? 'disabled' : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const minAttr = config.minDate ? `min="${config.minDate}"` : '';
  const maxAttr = config.maxDate ? `max="${config.maxDate}"` : '';
  const valueAttr = config.defaultValue ? `value="${config.defaultValue}"` : '';

  return `
    <label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input
      type="date"
      id="${id}"
      class="ukpa-input ${config.cssClass || ''}"
      placeholder="${config.placeholder || ''}"
      ${valueAttr}
      ${minAttr}
      ${maxAttr}
      ${disabledAttr}
      ${tooltipAttr}
      data-id="${id}"
      data-name="${config.name || config.label || id}"
      ${config.calcRequired ? 'data-calc-required="true"' : ''}
    />
  `;
}
