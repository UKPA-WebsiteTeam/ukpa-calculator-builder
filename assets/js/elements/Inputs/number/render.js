// /elements/number/render.js
export default function renderNumber(type, id, config = {}) {
  const value = config.value ?? 0;
  const dataAttr = `data-id="${id}" data-name="${config.name || config.label || id}"`;
  const isCalcRequiredAttr = config.calcRequired ? 'data-calc-required="true"' : '';
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';
  const style = config.width ? `style="width: ${config.width};"` : '';

  const html = `
    <label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input type="number" id="${id}" value="${value}"
      placeholder="${config.placeholder || ''}"
      class="ukpa-input"
      ${dataAttr} ${isCalcRequiredAttr}
      min="${config.min}" max="${config.max}" step="${config.step}"
      ${style} />
  `;

  const wrapper = document.createElement('div');
  wrapper.classList.add('ukpa-field-wrapper');
  wrapper.innerHTML = html;

  return wrapper;
}
