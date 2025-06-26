export default function renderNumber(id, config, meta) {
  const isDigitLimit = !!config.maxChar; // If maxChar is set, we use text input with numeric pattern

  const minAttr = config.min !== '' ? `min="${config.min}"` : '';
  const maxAttr = config.max !== '' ? `max="${config.max}"` : '';
  const stepAttr = !isDigitLimit ? `step="${config.step ?? 1}"` : '';
  const widthStyle = config.width ? `style="width: ${config.width};"` : '';

  const typeSpecificAttrs = isDigitLimit
    ? `maxlength="${config.maxChar}" type="text" inputmode="numeric" pattern="\\d*"`
    : `type="number"`;

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <input
      id="${id}"
      name="${config.name || id}"
      placeholder="${config.placeholder || ''}"
      value="${config.value ?? ''}"
      ${minAttr}
      ${maxAttr}
      ${stepAttr}
      ${typeSpecificAttrs}
      ${widthStyle}
      class="ukpa-input"
      ${meta.dataAttr}
      ${meta.isCalcRequiredAttr}
    />
  `;
}
