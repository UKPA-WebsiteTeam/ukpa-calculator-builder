export default {
  label: 'Checkbox',
  icon: '☑️',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'name', 'calcRequired', 'defaultChecked'] },
    { group: 'Advanced Settings', fields: ['cssClass', 'disabled', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Checkbox Label',
    name: 'checkboxField',
    defaultChecked: false,
    calcRequired: false,
    cssClass: '',
    disabled: false,
    tooltip: '',
    conditions: []
  }
};
