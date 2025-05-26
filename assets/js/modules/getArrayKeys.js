export function getArrayKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...getArrayKeys(value, fullKey));
    }
  }
  return keys;
}
