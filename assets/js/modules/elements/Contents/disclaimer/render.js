export default function renderDisclaimer(id, config) {
  const tooltipAttr = config.tooltip ? `title="${config.tooltip}"` : '';
  const style = `
    text-align: ${config.textAlign};
    background-color: ${config.backgroundColor};
    color: ${config.textColor};
    padding: ${config.padding};
    border-radius: ${config.borderRadius};
  `;

  return `
    <div id="${id}" class="ab-disclaimer ${config.cssClass || ''}"
         data-id="${id}" data-name="${config.name || config.label || id}"
         ${tooltipAttr} style="${style}">
      <strong class="ab-disclaimer-label">${config.label || 'Disclaimer'}</strong>
    </div>
  `;
}
