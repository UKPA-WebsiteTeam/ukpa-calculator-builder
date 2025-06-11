import render from './render.js';
import settings from './settings.js';

export default {
  type: 'link',
  label: 'Hyperlink',
  icon: '🔗',
  default: {
    label: 'Click Here',
    url: '#',
    conditions: []
  },
  settings,
  render
};
