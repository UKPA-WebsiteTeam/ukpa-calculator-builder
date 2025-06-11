export default {
  label: 'Link',
  icon: '🔗',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'href'] },
    { group: 'Advanced Settings', fields: ['target', 'cssClass', 'tooltip', 'alignment', 'conditions'] }
  ],
  default: {
    label: 'Click Here',
    href: '#',
    target: '_blank',
    cssClass: '',
    tooltip: '',
    alignment: 'left',
    conditions: []
  }
};
