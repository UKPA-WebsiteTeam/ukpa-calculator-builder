export default [
  {
    group: 'Text Field Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        default: 'Text Field',
        tooltip: 'Label shown above the input.'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        default: 'text',
        tooltip: 'Field identifier for logic/calculations.'
      },
      {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        default: 'Enter text',
        tooltip: 'Shown in the input before text is entered.'
      },
      {
        key: 'maxLength',
        label: 'Max Length',
        type: 'number',
        default: 100,
        tooltip: 'Maximum characters allowed.'
      },
      {
        key: 'calcRequired',
        label: 'Required',
        type: 'checkbox',
        default: false,
        tooltip: 'Mark as required field.'
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
