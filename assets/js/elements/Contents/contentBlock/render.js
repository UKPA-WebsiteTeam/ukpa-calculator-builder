export default function renderContentBlock(id, config, meta = {}) {
  const classes = config.style || '';
  return `
    <div id="${id}" class="ukpa-content-block ${classes}" ${meta.dataAttr || ''}>
      ${config.label || ''}
    </div>
  `;
}
