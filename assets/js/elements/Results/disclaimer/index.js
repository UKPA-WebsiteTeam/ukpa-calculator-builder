import render from './render.js';
import settings from './settings.js';

export default {
  type: 'disclaimer',
  label: 'Disclaimer',
  icon: '⚠️',
  default: {
    label: 'Disclaimer',
    text: '',
    conditions: []
  },
  settings,
  render
};
