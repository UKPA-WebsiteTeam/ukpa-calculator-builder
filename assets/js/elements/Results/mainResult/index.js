import render from './render.js';
import settings from './settings.js';

export default {
  type: 'mainResult',
  label: 'Main Result',
  icon: '💡',
  default: {
    label: 'Main Result',
    dynamicResult: '',
    calcRequired: false,
    tooltip: '',
    conditions: []
  },
  settings,
  render
};
