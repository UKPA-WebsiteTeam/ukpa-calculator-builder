export default {
  label: 'Radio Group',
  icon: '🔘',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'name', 'options', 'calcRequired'] },
    { group: 'Advanced Settings', fields: ['defaultValue', 'layout', 'cssClass', 'disabled', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Radio Group',
    name: 'radioField',
    options: ['Option 1', 'Option 2'],
    defaultValue: '',
    layout: 'vertical', // or 'horizontal'
    calcRequired: false,
    cssClass: '',
    disabled: false,
    tooltip: '',
    conditions: []
  }
};
