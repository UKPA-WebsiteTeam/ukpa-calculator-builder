// Recursively extract all key paths from an object/array for dropdowns
export function getTopLevelKeysForDropdown(obj, prefix = '') {
  let keys = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      keys = keys.concat(getTopLevelKeysForDropdown(item, `${prefix}[${idx}]`));
    });
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      keys = keys.concat(getTopLevelKeysForDropdown(obj[key], newPrefix));
    }
  } else if (prefix) {
    keys.push(prefix);
  }
  return keys;
}
