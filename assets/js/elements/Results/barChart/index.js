import render from './render.js';
import settings from './settings.js';

export default {
  type: 'barChart',
  label: 'Bar Chart',
  icon: '📈',
  default: {
    label: 'Chart',
    resultKey: 'chart',
    resultDropdownKey: '',
    resultOptions: [],
    conditions: []
  },
  settings,
  render
};
