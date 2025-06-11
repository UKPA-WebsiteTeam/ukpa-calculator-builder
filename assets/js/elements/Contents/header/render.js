export default function renderHeader(id, config, meta) {
  const level = config.level || 'h2';
  return `<${level} ${meta.dataAttr || ''}>${config.label || 'Heading'}</${level}>`;
}
