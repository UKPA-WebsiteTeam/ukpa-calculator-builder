export default function renderNumber(id, config, meta) {
  const isDigitLimit = !!config.maxChar; // If maxChar is set, we use text input with numeric pattern

  const minAttr = config.min !== '' ? `min="${config.min}"` : '';
  const maxAttr = config.max !== '' ? `max="${config.max}"` : '';
  const stepAttr = !isDigitLimit ? `step="${config.step ?? 1}"` : '';
  const widthStyle = config.width ? `style="width: ${config.width};"` : '';

  const typeSpecificAttrs = isDigitLimit ? `maxlength="${config.maxChar}"` : '';

  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <div class="ukpa-number-input-inside-wrapper">
      ${config.prefix ? `<span class="ukpa-number-prefix-inside">${config.prefix}</span>` : ''}
      <input
        id="${id}"
        name="${config.name || id}"
        placeholder="${config.placeholder || ''}"
        value="${config.value ?? ''}"
        ${minAttr}
        ${maxAttr}
        ${stepAttr}
        type="number" inputmode="decimal" pattern="[0-9.,]*"
        class="ukpa-input ukpa-number-input${config.prefix ? ' has-prefix' : ''}${config.suffix ? ' has-suffix' : ''}"
        ${typeSpecificAttrs}
        ${widthStyle}
        ${meta.dataAttr}
        ${meta.isCalcRequiredAttr}
      />
      ${config.suffix ? `<span class="ukpa-number-suffix-inside">${config.suffix}</span>` : ''}
    </div>
  `;
}
