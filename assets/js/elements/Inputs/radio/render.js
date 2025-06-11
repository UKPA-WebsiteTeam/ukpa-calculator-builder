export default function renderRadio(id, config, meta) {
  const options = (config.options || []).map(opt => {
    return `<label><input type="radio" name="${id}" value="${opt.value}"> ${opt.label}</label>`;
  }).join('');
  
  return `
    <label>${config.label || ''} ${meta.requiredMark || ''}</label>
    <div class="ukpa-radio-group" ${meta.dataAttr} ${meta.isCalcRequiredAttr}>
      ${options}
    </div>
  `;
}
