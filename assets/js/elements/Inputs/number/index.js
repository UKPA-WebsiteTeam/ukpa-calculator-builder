import render from './render.js';
import settings from './settings.js';

export default {
  type: 'number',
  label: 'Number Field',
  icon: '🔢',
  default: {
    label: 'Number Field',
    name: 'numberField',
    placeholder: 'Enter a number',
    min: '',
    max: '',
    step: 1,
    calcRequired: false,
    value: 0,
    width: '',
    conditions: []
  },
  settings,
  render
};
