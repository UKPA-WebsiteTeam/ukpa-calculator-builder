import render from './render.js';
import settings from './settings.js';

export default {
  type: 'checkbox',
  label: 'Checkbox',
  icon: '☑️',
  default: {
    label: 'Tick if true',
    name: 'checkbox',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
