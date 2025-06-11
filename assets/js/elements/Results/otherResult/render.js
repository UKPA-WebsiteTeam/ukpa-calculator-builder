export default function renderOtherResult(id, config, meta) {
  const key = config.resultDropdownKey || '';
  const layoutClass = config.layout === 'column' ? 'ab-other-block' : 'ab-other-inline';

  return `
    <div class="ab-other-result other-section ${layoutClass}" data-key="${key}" data-layout="${config.layout || 'row'}">
      <div class="ab-other-label">${config.label || 'Other Result'}</div>
      <div class="ab-other-value">--</div>
    </div>
  `;
}
