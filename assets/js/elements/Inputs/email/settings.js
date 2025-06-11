export default [
  {
    group: 'Email Field Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        default: 'Email Address',
        tooltip: 'Label shown above the email input field.'
      },
      {
        key: 'name',
        label: 'Field Name',
        type: 'text',
        default: 'email',
        tooltip: 'This name is used to identify the field in calculations.'
      },
      {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        default: 'Enter your email',
        tooltip: 'Text shown inside the field before the user types.'
      },
      {
        key: 'calcRequired',
        label: 'Required',
        type: 'checkbox',
        default: false,
        tooltip: 'Mark this field as required.'
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
