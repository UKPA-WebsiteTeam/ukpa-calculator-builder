// Sanitize a single value (remove currency, commas, etc. and convert to number if possible)
export function sanitizeResultValue(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Remove currency symbols, commas, spaces
    const cleaned = val.replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? val : num;
  }
  return val;
}

// Recursively sanitize an object or array
export function sanitizeResultsObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeResultsObject);
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k in obj) {
      out[k] = sanitizeResultsObject(obj[k]);
    }
    return out;
  }
  return sanitizeResultValue(obj);
} 