export default function renderImage(id, config) {
  return `<img src="${config.url || ''}" alt="${config.altText || 'Image Element'}" />`;
}
