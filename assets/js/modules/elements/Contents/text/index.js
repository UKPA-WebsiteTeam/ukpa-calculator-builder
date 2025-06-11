export default {
  label: 'Text Field',
  icon: '✏️',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'name', 'placeholder', 'value', 'calcRequired'] },
    { group: 'Validation', fields: ['minLength', 'maxLength', 'pattern'] },
    { group: 'Advanced Settings', fields: ['cssClass', 'disabled', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Text Field',
    name: 'textField',
    placeholder: 'Enter text',
    value: '',
    minLength: '',
    maxLength: '',
    pattern: '',
    calcRequired: false,
    cssClass: '',
    disabled: false,
    tooltip: '',
    conditions: []
  }
};
