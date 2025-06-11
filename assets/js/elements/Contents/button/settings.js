export default [
  {
    group: 'Button Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        tooltip: 'The text shown on the button'
      },
      {
        key: 'action',
        label: 'Action',
        type: 'select',
        options: ['submit', 'reset', 'next', 'custom'],
        tooltip: 'The action triggered when the button is clicked'
      }
    ]
  }
];
