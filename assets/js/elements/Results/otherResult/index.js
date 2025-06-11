import render from './render.js';
import settings from './settings.js';

export default {
  type: 'otherResult',
  label: 'Other Result',
  icon: '📌',
  default: {
    label: 'Other Result',
    resultKey: 'otherResult',
    resultDropdownKey: '',
    resultOptions: [],
    layout: 'column',
    conditions: []
  },
  settings,
  render
};
