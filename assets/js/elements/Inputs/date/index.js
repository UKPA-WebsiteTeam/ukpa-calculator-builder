import render from './render.js';
import settings from './settings.js';

export default {
  type: 'date',
  label: 'Custom Date',
  icon: '📅',
  default: {
    label: 'Pick a date',
    name: 'customDate',
    placeholder: 'Month Date, Year',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
