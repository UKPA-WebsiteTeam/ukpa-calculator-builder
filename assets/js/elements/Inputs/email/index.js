import render from './render.js';
import settings from './settings.js';

export default {
  type: 'email',
  label: 'Email Input',
  icon: '📧',
  default: {
    label: 'Email Address',
    name: 'email',
    placeholder: 'Enter your email',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
