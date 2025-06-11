export default function renderEmail(id, config, meta) {
  return `
    <label for="${id}">${config.label || ''} ${meta.requiredMark}</label>
    <input type="email" id="${id}" placeholder="${config.placeholder || ''}" 
      class="ukpa-input" ${meta.dataAttr} ${meta.isCalcRequiredAttr} />`;
}
