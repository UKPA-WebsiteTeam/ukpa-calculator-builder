export function createInfoTooltip(tooltipText) {
    // Create container
    const container = document.createElement('span');
    container.className = 'tooltip-container';
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

    // Function to set tooltip max-width (CSS handles positioning)
    const setTooltipWidth = () => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth <= 600;
      // Set max-width, CSS will handle the rest
      tooltip.style.maxWidth = isMobile ? 'calc(100vw - 2em)' : '500px';
      tooltip.style.width = 'auto';
      tooltip.style.minWidth = '250px';
    };

    // Set initial width
    setTimeout(setTooltipWidth, 0);
    
    // Update on window resize
    window.addEventListener('resize', setTooltipWidth);
  
    // Show on hover
    container.addEventListener('mouseenter', () => {
      setTooltipWidth();
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      tooltip.style.pointerEvents = 'none';
    });
    container.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.pointerEvents = 'none';
    });
  
    // Compose elements
    container.appendChild(icon);
    container.appendChild(tooltip);
  
    return container;
  }
  