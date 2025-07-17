export function validateName(input) {
  const nameRegex = /^[A-Za-z\s\-]{2,}$/;
  const isValid = nameRegex.test(input.value.trim());

  if (!isValid) {
    input.setCustomValidity("Only letters, spaces or hyphens. Minimum 2 characters.");
    input.reportValidity();
  } else {
    input.setCustomValidity("");
  }
}
