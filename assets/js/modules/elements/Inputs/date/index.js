export default {
  label: 'Date Picker',
  icon: '📅',
  fields: [
    { group: 'Basic Settings', fields: ['label', 'name', 'placeholder', 'calcRequired'] },
    { group: 'Advanced Settings', fields: ['minDate', 'maxDate', 'defaultValue', 'cssClass', 'disabled', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'Date Field',
    name: 'dateField',
    placeholder: 'Select a date',
    defaultValue: '',
    minDate: '',
    maxDate: '',
    calcRequired: false,
    cssClass: '',
    disabled: false,
    tooltip: '',
    conditions: []
  }
};
