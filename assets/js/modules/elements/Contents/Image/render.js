export default function renderImage(id, config) {
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const alignmentStyle = config.alignment ? `text-align: ${config.alignment};` : '';

  return `
    <div style="${alignmentStyle}">
      <img
        id="${id}"
        src="${config.url || ''}"
        alt="${config.altText || ''}"
        style="width: ${config.width || '100%'}; height: ${config.height || 'auto'};"
        class="${config.cssClass || ''}"
        ${tooltipAttr}
        data-id="${id}"
        data-name="${config.name || config.altText || id}"
      />
    </div>
  `;
}
