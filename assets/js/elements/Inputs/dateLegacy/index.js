import render from './render.js';
import settings from './settings.js';

export default {
  type: 'date',
  label: 'Custom Date',
  icon: '📅',
  default: {
    label: 'Pick a date',
    name: 'taxYear',
    value: '2025-01-01',
    placeholder: 'Month Date, Year',
    calcRequired: false,
    conditions: []
  },
  settings,
  render
};
