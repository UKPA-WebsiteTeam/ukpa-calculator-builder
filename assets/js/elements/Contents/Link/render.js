export default function renderLink(id, config, meta) {
  return `<a href="${config.url || '#'}" target="_blank" ${meta.dataAttr}>${config.label || 'Click Here'}</a>`;
}
