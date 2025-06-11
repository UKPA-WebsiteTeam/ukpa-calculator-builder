export default {
  label: 'Text Block',
  icon: '📝',
  fields: [
    { group: 'Basic Settings', fields: ['label'] },
    { group: 'Advanced Settings', fields: ['tag', 'cssClass', 'alignment', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'This is a text block.',
    tag: 'p',
    cssClass: '',
    alignment: 'left',
    tooltip: '',
    conditions: []
  }
};
