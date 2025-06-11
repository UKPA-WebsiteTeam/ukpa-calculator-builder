export default function renderLink(id, config) {
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const alignmentStyle = config.alignment ? `text-align: ${config.alignment};` : '';

  return `
    <div style="${alignmentStyle}">
      <a
        id="${id}"
        href="${config.href || '#'}"
        target="${config.target || '_blank'}"
        class="${config.cssClass || ''}"
        ${tooltipAttr}
        data-id="${id}"
        data-name="${config.name || config.label || id}"
      >
        ${config.label || 'Link'}
      </a>
    </div>
  `;
}
