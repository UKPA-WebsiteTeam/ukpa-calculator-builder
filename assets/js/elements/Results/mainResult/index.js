export default {
  label: 'Main Result',
  icon: '📢',
  fields: [
    { group: 'Display', fields: ['label', 'dynamicResult', 'prefix', 'suffix', 'cssClass'] },
    { group: 'Formatting', fields: ['fontSize', 'textAlign'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'conditions'] }
  ],
  default: {
    label: 'Main Result',
    dynamicResult: '',
    prefix: '',
    suffix: '',
    cssClass: '',
    fontSize: '24px',
    textAlign: 'center',
    tooltip: '',
    conditions: []
  }
};
