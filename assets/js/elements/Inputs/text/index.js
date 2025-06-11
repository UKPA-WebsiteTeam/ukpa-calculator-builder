import render from './render.js';
import settings from './settings.js';

export default {
  type: 'text',
  label: 'Text Field',
  icon: '🔤',
  default: {
    label: 'Text Field',
    name: 'text',
    placeholder: 'Enter text',
    maxLength: '100',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
