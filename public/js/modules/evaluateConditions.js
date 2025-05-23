export function evaluateConditions(rules = []) {
  return rules.every(rule => {
    const field = document.getElementById(rule.field);
    if (!field) return false;

    const value = field.type === 'checkbox' ? field.checked : field.value;

    switch (rule.operator) {
      case 'equals': return value == rule.value;
      case 'not_equals': return value != rule.value;
      case 'contains': return String(value).includes(rule.value);
      case 'not_contains': return !String(value).includes(rule.value);
      default: return true;
    }
  });
}
