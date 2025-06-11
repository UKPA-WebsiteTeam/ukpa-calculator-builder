export default {
  label: 'Dropdown',
  icon: '📋',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'name', 'placeholder', 'options', 'value', 'calcRequired'] },
    { group: 'Dynamic Options', fields: ['dynamicResult'] },
    { group: 'Advanced Settings', fields: ['cssClass', 'disabled', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Dropdown',
    name: 'dropdown',
    placeholder: 'Select...',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' }
    ],
    value: '',
    dynamicResult: '',
    calcRequired: false,
    cssClass: '',
    disabled: false,
    tooltip: '',
    conditions: []
  }
};
