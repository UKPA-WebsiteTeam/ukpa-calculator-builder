export default {
  label: 'Number Field',
  icon: '🔢',
  categories: ['Input', 'Numeric'],
  settings: [
    {
      group: 'Basic Settings',
      options: [
        { key: 'label', label: 'Field Label', type: 'text' },
        { key: 'name', label: 'Parameter Name', type: 'text' },
        { key: 'placeholder', label: 'Placeholder Text', type: 'text' }
      ]
    },
    {
      group: 'Validation',
      options: [
        { key: 'min', label: 'Minimum Value', type: 'number' },
        { key: 'max', label: 'Maximum Value', type: 'number' },
        { key: 'step', label: 'Step', type: 'number', default: 1 },
        { key: 'calcRequired', label: 'Required?', type: 'checkbox' }
      ]
    },
    {
      group: 'Default Value',
      options: [
        { key: 'value', label: 'Default Number', type: 'number', default: 0 }
      ]
    },
    {
      group: 'Display Options',
      options: [
        { key: 'width', label: 'Field Width', type: 'text', placeholder: 'e.g. 100% or 300px' }
      ]
    }
  ],
  default: {
    label: 'Number Field',
    name: 'numberField',
    placeholder: 'Enter a number',
    min: '',
    max: '',
    step: 1,
    calcRequired: false,
    value: 0,
    width: ''
  }
};
