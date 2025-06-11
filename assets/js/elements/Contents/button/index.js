import render from './render.js';
import settings from './settings.js';

export default {
  type: 'button',
  label: 'Button',
  icon: '🖱️',
  default: {
    label: 'Submit',
    action: 'submit',
    conditions: []
  },
  settings,
  render
};
