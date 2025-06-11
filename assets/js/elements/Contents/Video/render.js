export default function renderVideo(id, config) {
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const alignmentStyle = config.alignment ? `text-align: ${config.alignment};` : '';

  const autoplayAttr = config.autoplay ? 'autoplay' : '';
  const controlsAttr = config.controls !== false ? 'controls' : '';
  const loopAttr = config.loop ? 'loop' : '';

  return `
    <div style="${alignmentStyle}">
      <video
        id="${id}"
        src="${config.url || ''}"
        style="width: ${config.width || '100%'}; height: ${config.height || '300px'};"
        class="${config.cssClass || ''}"
        ${tooltipAttr}
        ${autoplayAttr}
        ${controlsAttr}
        ${loopAttr}
        data-id="${id}"
        data-name="${config.name || config.label || id}"
      ></video>
    </div>
  `;
}
