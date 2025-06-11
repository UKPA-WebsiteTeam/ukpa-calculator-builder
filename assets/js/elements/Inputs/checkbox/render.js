export default function renderCheckbox(id, config) {
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';
  const checkedAttr = config.defaultChecked ? 'checked' : '';
  const disabledAttr = config.disabled ? 'disabled' : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';

  return `
    <label>
      <input
        type="checkbox"
        id="${id}"
        class="${config.cssClass || ''}"
        ${checkedAttr}
        ${disabledAttr}
        ${tooltipAttr}
        data-id="${id}"
        data-name="${config.name || config.label || id}"
        ${config.calcRequired ? 'data-calc-required="true"' : ''}
      />
      ${config.label || ''} ${requiredMark}
    </label>
  `;
}
