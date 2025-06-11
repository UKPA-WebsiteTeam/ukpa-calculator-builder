import render from './render.js';
import settings from './settings.js';

export default {
  type: 'header',
  label: 'Heading',
  icon: '🔠',
  default: {
    label: 'Heading Text',
    level: 'h2',
    conditions: []
  },
  settings,
  render
};
