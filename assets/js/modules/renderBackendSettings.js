import { flattenScalarKeys, flattenKeys } from './flattenKeys.js';
import { getArrayKeys } from './getArrayKeys.js';
import { saveElementConfig } from './saveElementConfig.js';

function getChildObjectKeys(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).filter(key => {
    const val = obj[key];
    // Array of objects
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') return true;
    // Object with at least one child object/array
    if (
      val && typeof val === 'object' &&
      Object.values(val).some(
        v => (typeof v === 'object' && v !== null) || Array.isArray(v)
      )
    ) return true;
    return false;
  });
}

export function renderBackendSettings(id, config = {}) {
  const box = document.getElementById('ukpa-route-param-box');
  box.innerHTML = '';

  const el = document.querySelector(`.ukpa-element[data-id="${id}"]`);
  if (!el) return;

  const type = el.dataset.type;
  const resultTypes = ['mainResult', 'breakdown', 'barChart', 'otherResult'];
  if (!resultTypes.includes(type)) return;

  let keys = [];
  if (window.ukpaResults && typeof window.ukpaResults === 'object') {
    if (type === 'mainResult') {
      keys = flattenScalarKeys(window.ukpaResults);
    } else {
      keys = getChildObjectKeys(window.ukpaResults);
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ukpa-editor-field';

  const label = document.createElement('label');
  label.innerHTML = `
    Dynamic Result Value:
    <span class="ukpa-tooltip-icon" title="For 'Main Result', only single-value fields from the API response are available. For 'Other Result' and 'Bar Chart', the selected key must point to a nested object or array with multiple values.">ℹ️</span>
  `;

  const select = document.createElement('select');
  select.className = 'ukpa-input';
  select.innerHTML = `<option value="">-- Select --</option>`;

  keys.forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key;
    if (config.dynamicResult === key) opt.selected = true;
    select.appendChild(opt);
  });

  // If saved value is not in keys, add it as an option
  if (config.dynamicResult && !keys.includes(config.dynamicResult)) {
    const opt = document.createElement('option');
    opt.value = config.dynamicResult;
    opt.textContent = config.dynamicResult + ' (saved)';
    opt.selected = true;
    select.appendChild(opt);
  }

  select.addEventListener('change', () => {
    config.dynamicResult = select.value;
    el.dataset.config = JSON.stringify(config);
    saveElementConfig({ el, type, id, config, editElementById: window.editElementById });
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  box.appendChild(wrapper);
}
