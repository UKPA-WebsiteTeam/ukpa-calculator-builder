export default function renderText(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <input type="text" id="${id}" maxlength="${config.maxLength || 100}" 
      placeholder="${config.placeholder || ''}" 
      class="ukpa-input" ${meta.dataAttr} ${meta.isCalcRequiredAttr} />`;
}
