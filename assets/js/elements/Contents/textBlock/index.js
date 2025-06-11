import render from './render.js';
import settings from './settings.js';

export default {
  type: 'textBlock',
  label: 'Text Block',
  icon: '📝',
  default: {
    label: 'This is a block of text.',
    conditions: []
  },
  settings,
  render
};
