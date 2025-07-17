export function toggleNameFields(el) {
  const show = el.value === 'no';
  document.getElementById('updatedNameFields').style.display = show ? 'grid' : 'none';
}
