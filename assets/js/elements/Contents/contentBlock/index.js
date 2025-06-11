import render from './render.js';
import settings from './settings.js';

export default {
  label: 'Content Block',
  icon: '🧱',
  allowedZones: ['content'],
  fields: ['label'],
  settings,
  render
};
