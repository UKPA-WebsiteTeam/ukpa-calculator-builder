// ✅ Returns ALL possible paths (including array children like breakdown.0.tax)
export function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      // If array contains objects, recursively extract first element's structure
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        keys.push(...flattenKeys(value[0], `${newKey}.0`));
      } else {
        keys.push(newKey); // e.g., if it's an array of numbers or strings
      }
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

// ✅ Returns only flat scalar keys (for mainResult type use only)
export function flattenScalarKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      continue; // ❌ skip arrays entirely
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenScalarKeys(value, newKey));
    } else {
      keys.push(newKey); // ✅ string, number, boolean, null
    }
  }
  return keys;
}
