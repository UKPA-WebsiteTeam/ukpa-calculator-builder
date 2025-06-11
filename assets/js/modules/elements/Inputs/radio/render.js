export default function renderRadio(id, config) {
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';
  const disabledAttr = config.disabled ? 'disabled' : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const layoutClass = config.layout === 'horizontal' ? 'ukpa-radio-inline' : 'ukpa-radio-vertical';

  const options = (config.options || []).map(opt => {
    const label = typeof opt === 'object' ? opt.label : opt;
    const value = typeof opt === 'object' ? opt.value : opt;
    const checked = config.defaultValue === value ? 'checked' : '';
    return `
      <label class="${layoutClass}">
        <input
          type="radio"
          name="${id}"
          value="${value}"
          class="${config.cssClass || ''}"
          ${checked}
          ${disabledAttr}
          ${tooltipAttr}
          data-id="${id}"
          data-name="${config.name || config.label || id}"
          ${config.calcRequired ? 'data-calc-required="true"' : ''}
        />
        ${label}
      </label>
    `;
  }).join('');

  return `<div class="ukpa-radio-group"><strong>${config.label || ''} ${requiredMark}</strong><br />${options}</div>`;
}
