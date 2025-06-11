import render from './render.js';
import settings from './settings.js';

export default {
  type: 'breakdown',
  label: 'Breakdown Table',
  icon: '📊',
  default: {
    label: 'Breakdown',
    resultKey: 'breakdown',
    resultDropdownKey: '',
    resultOptions: [],
    conditions: []
  },
  settings,
  render
};
