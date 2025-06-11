export default function renderEmail(id, config, meta = {}) {
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';
  const disabledAttr = config.disabled ? 'disabled' : '';
  const patternAttr = config.pattern ? `pattern="${config.pattern}"` : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';

  return `
    <label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input
      type="email"
      id="${id}"
      class="ukpa-input ${config.cssClass || ''}"
      value="${config.value || ''}"
      placeholder="${config.placeholder || ''}"
      ${patternAttr}
      ${disabledAttr}
      ${tooltipAttr}
      data-id="${id}"
      data-name="${config.name || config.label || id}"
      ${config.calcRequired ? 'data-calc-required="true"' : ''}
    />
  `;
}
