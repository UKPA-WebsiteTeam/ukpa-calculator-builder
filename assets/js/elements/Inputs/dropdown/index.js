import render from './render.js';
import settings from './settings.js';

export default {
  type: 'dropdown',
  label: 'Dropdown',
  icon: '⬇️',
  default: {
    label: 'Select an option',
    name: 'dropdown',
    placeholder: '',
    calcRequired: false,
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' }
    ],
    conditions: []
  },
  settings,
  render
};
