export function createInfoTooltip(tooltipText) {
    // Create container
    const container = document.createElement('span');
    container.className = 'tooltip-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.verticalAlign = 'middle';
  
    // Create icon
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.style.cursor = 'pointer';
  
    const img = document.createElement('img');
    img.src = 'https://cdn-icons-png.flaticon.com/512/471/471664.png';
    img.width = 18;
    img.alt = 'Info';
  
    icon.appendChild(img);
  
    // Create tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
  
    // Tooltip styling
    tooltip.style.position = 'absolute';
    tooltip.style.top = '-0.5em';
    tooltip.style.left = '2em';
    tooltip.style.background = '#e3e3e354';
    tooltip.style.padding = '0.3em 0.6em';
    tooltip.style.border = '1px solid #e3e3e3';
    tooltip.style.borderRadius = '0.5em';
    tooltip.style.fontSize = '0.85em';
    tooltip.style.fontWeight = 'normal';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.maxWidth = '300px';
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.overflowWrap = 'break-word';
    tooltip.style.wordBreak = 'break-word';
    tooltip.style.opacity = '0';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.transition = 'all 0.2s';
    tooltip.style.zIndex = '10';
    tooltip.style.boxSizing = 'border-box';
    
    // Mobile detection and responsive styles
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      tooltip.style.maxWidth = 'calc(100vw - 2em)';
      tooltip.style.whiteSpace = 'normal';
    }
  
    // Show on hover
    container.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
      tooltip.style.pointerEvents = 'auto';
    });
    container.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      tooltip.style.pointerEvents = 'none';
    });
  
    // Compose elements
    container.appendChild(icon);
    container.appendChild(tooltip);
  
    return container;
  }
  