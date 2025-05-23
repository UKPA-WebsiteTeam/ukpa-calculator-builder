export function toggleBox(id) {
  const body = document.getElementById(id);
  if (!body) return;
  const icon = body.previousElementSibling?.querySelector('.toggle-indicator');
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  if (icon) icon.textContent = isHidden ? '↰' : '⇩';
}
