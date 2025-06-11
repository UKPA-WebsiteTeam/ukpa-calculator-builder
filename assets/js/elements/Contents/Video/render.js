export default function renderVideo(id, config, meta) {
  return `<iframe src="${config.url || ''}" frameborder="0" allowfullscreen ${meta.dataAttr}></iframe>`;
}
