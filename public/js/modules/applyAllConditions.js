import { evaluateConditions } from './evaluateConditions.js';

export function applyAllConditions() {
  document.querySelectorAll('.ukpa-conditional').forEach(el => {
    try {
      const rules = JSON.parse(el.dataset.conditions || '[]');
      const shouldShow = evaluateConditions(rules);
      el.style.display = shouldShow ? '' : 'none';
    } catch (err) {
      console.warn('Invalid condition format on element:', el, err);
    }
  });
}
