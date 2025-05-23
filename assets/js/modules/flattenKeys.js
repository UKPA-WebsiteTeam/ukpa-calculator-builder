export function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        keys.push(...flattenKeys(value[0], `${newKey}.0`));
      } else {
        keys.push(newKey);
      }
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}
