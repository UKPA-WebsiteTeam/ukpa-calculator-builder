export default [
  {
    group: 'Radio Settings',
    options: [
      { key: 'label', label: 'Label', type: 'text', default: 'Select one' },
      { key: 'name', label: 'Backend Name', type: 'text', default: 'radio' },
      { key: 'options', label: 'Options', type: 'optionList', default: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' }
      ]},
      { key: 'calcRequired', label: 'Required', type: 'checkbox', default: false }
    ]
  }
];
