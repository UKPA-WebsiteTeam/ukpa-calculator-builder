export default [
  {
    group: 'Dropdown Settings',
    options: [
      { key: 'label', label: 'Label', type: 'text', default: 'Select an option', tooltip: 'This is the label shown in the frontend.' },
      { key: 'name', label: 'Backend Name', type: 'text', default: 'dropdownField', tooltip: 'This is the key which should match with what backend is expecting.' },
      { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Choose...' },
      {
        key: 'options',
        label: 'Dropdown Options',
        type: 'optionList', // 🟡 We'll custom-render this
        default: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' }
        ]
      }
    ]
  }
];
