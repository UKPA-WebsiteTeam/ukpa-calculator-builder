export default function renderOtherResult(id, config, meta) {
  const layout = config.layout || 'row';
  const wrap = config.wrap !== false; // true by default
  const widths = config.widths || {};
  const key = config.dynamicResult || '';

  return `
    <div
      id="${id}"
      class="ab-other-result other-section ab-other-${layout} ${wrap ? 'wrap-enabled' : 'no-wrap'}"
      data-key="${key}"
      data-layout="${layout}"
      data-wrap="${wrap}"
      data-widths='${JSON.stringify(widths)}'>
      <div class="ab-other-label">${config.label || 'Other Result'}</div>
      <div class="ab-other-value">--</div>
    </div>
  `;
}
