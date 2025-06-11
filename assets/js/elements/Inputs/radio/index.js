import render from './render.js';
import settings from './settings.js';

export default {
  type: 'radio',
  label: 'Radio',
  icon: '🔘',
  default: {
    label: 'Select one',
    name: 'radio',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' }
    ],
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
