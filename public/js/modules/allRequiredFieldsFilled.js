export function allRequiredFieldsFilled() {
  const requiredFields = document.querySelectorAll('[required]');
  for (const field of requiredFields) {
    // Hidden by condition logic? Skip it
    if (field.closest('.ukpa-conditional')?.style.display === 'none') continue;

    const type = field.type;

    if (
      (type === 'checkbox' && !field.checked) ||
      (type === 'radio' && !document.querySelector(`input[name="${field.name}"]:checked`)) ||
      (!['checkbox', 'radio'].includes(type) && !field.value?.trim())
    ) {
      return false;
    }
  }
  return true;
}
