export function toggleDropdown(trigger) {
  const targetId = trigger.getAttribute('data-target');
  const dropdown = document.getElementById(targetId);
  document.querySelectorAll('.dropdown-content').forEach(dd => {
    if (dd !== dropdown) dd.style.display = 'none';
  });
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
