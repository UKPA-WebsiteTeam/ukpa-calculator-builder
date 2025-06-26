export default [
  {
    group: 'Number Field Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        default: 'Number Field',
        tooltip: 'Label shown above the input.'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        default: 'numberField',
        tooltip: 'Field identifier used in API and logic.'
      },
      {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        default: 'Enter a number',
        tooltip: 'Text shown when the field is empty.'
      },
      {
        key: 'maxChar',
        label: 'Max Character',
        type: 'number',
        default: 0,
        tooltip: 'Max lenth for this input field.'
      },
      {
        key: 'min',
        label: 'Minimum Value',
        type: 'number',
        tooltip: 'The minimum allowed value.'
      },
      {
        key: 'max',
        label: 'Maximum Value',
        type: 'number',
        tooltip: 'The maximum allowed value.'
      },
      {
        key: 'step',
        label: 'Step',
        type: 'number',
        default: 1,
        tooltip: 'Interval between valid values.'
      },
      {
        key: 'value',
        label: 'Default Value',
        type: 'number',
        default: 0,
        tooltip: 'Initial value shown when the form loads.'
      }
    ]
  },
  {
    group: 'Display',
    options: [
      {
        key: 'width',
        label: 'Field Width',
        type: 'text',
        placeholder: 'e.g. 100% or 300px',
        tooltip: 'Custom width of the field.'
      }
    ]
  },
  {
    group: 'Advanced',
    options: [
      {
        key: 'conditions',
        label: 'Conditional Logic',
        type: 'conditions'
      }
    ]
  }
];
