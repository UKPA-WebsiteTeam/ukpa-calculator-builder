export default {
  label: 'Header',
  icon: '🔠',
  fields: [
    { group: 'Basic Settings', fields: ['label'] },
    { group: 'Advanced Settings', fields: ['level', 'alignment', 'cssClass', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Header Title',
    level: 'h2',
    alignment: 'left',
    cssClass: '',
    tooltip: '',
    conditions: []
  }
};
