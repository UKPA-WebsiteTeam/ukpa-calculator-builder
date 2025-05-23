export function getTopLevelKeysForDropdown(obj) {
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      keys.push(`${key} [object]`);
    } else {
      keys.push(key);
    }
  }
  return keys;
}
