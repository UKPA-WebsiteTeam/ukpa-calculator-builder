export default function renderNumber(id, config = {}, meta = {}) {
  const value = config.value ?? 0;
  const dataAttr = meta.dataAttr || `data-id="${id}" data-name="${config.name || config.label || id}"`;
  const isCalcRequiredAttr = meta.isCalcRequiredAttr || '';
  const requiredMark = meta.requiredMark || '';
  const style = config.width ? `style="width: ${config.width};"` : '';

  return `
    <label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input type="number" id="${id}" value="${value}"
      placeholder="${config.placeholder || ''}"
      class="ukpa-input"
      ${dataAttr} ${isCalcRequiredAttr}
      min="${config.min}" max="${config.max}" step="${config.step}"
      ${style} />
  `;
}
