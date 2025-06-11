export default function renderHeader(id, config) {
  const Tag = config.level || 'h2';
  const alignmentStyle = config.alignment ? `text-align: ${config.alignment};` : '';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';

  return `
    <${Tag}
      id="${id}"
      class="${config.cssClass || ''}"
      style="${alignmentStyle}"
      ${tooltipAttr}
      data-id="${id}"
      data-name="${config.name || config.label || id}"
    >
      ${config.label || 'Header'}
    </${Tag}>
  `;
}
