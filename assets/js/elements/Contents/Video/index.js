import render from './render.js';
import settings from './settings.js';

export default {
  type: 'video',
  label: 'Video Embed',
  icon: '🎥',
  default: {
    url: '',
    conditions: []
  },
  settings,
  render
};
