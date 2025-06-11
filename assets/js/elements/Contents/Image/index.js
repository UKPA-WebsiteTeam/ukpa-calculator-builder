import render from './render.js';
import settings from './settings.js';

export default {
  type: 'image',
  label: 'Image',
  icon: '🖼️',
  default: {
    url: '',
    altText: '',
    conditions: []
  },
  settings,
  render
};
