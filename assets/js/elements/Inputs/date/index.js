import render from './render.js';
import settings from './settings.js';

export default {
  type: 'date',
  label: 'Date',
  icon: '📅',
  default: {
    label: 'Pick a date',
    name: 'date',
    placeholder: '',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
