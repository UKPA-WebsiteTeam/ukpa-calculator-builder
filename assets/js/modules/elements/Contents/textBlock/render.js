export default function renderTextBlock(id, config) {
  const Tag = config.tag || 'p';
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const alignmentStyle = config.alignment ? `text-align: ${config.alignment};` : '';

  return `
    <${Tag}
      id="${id}"
      class="${config.cssClass || ''}"
      style="${alignmentStyle}"
      ${tooltipAttr}
      data-id="${id}"
      data-name="${config.name || config.label || id}"
    >
      ${config.label || ''}
    </${Tag}>
  `;
}
