export default function renderText(id, config, meta) {
  const disabledAttr = config.disabled ? 'disabled' : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const cssClass = config.cssClass || '';
  const minLengthAttr = config.minLength ? `minlength="${config.minLength}"` : '';
  const maxLengthAttr = config.maxLength ? `maxlength="${config.maxLength}"` : '';
  const patternAttr = config.pattern ? `pattern="${config.pattern}"` : '';

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <input
      type="text"
      id="${id}"
      value="${config.value || ''}"
      placeholder="${config.placeholder || ''}"
      class="ukpa-input ${cssClass}"
      ${meta.dataAttr}
      ${meta.isCalcRequiredAttr}
      ${tooltipAttr}
      ${disabledAttr}
      ${minLengthAttr}
      ${maxLengthAttr}
      ${patternAttr}
    />
  `;
}
