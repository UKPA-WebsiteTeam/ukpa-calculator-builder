export default [
  {
    group: 'Main Result Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        default: 'Main Result',
        tooltip: 'This is the label shown above the main result value.'
      },
      {
        key: 'dynamicResult',
        label: 'Result Key',
        type: 'text',
        default: '',
        tooltip: 'This should match a key returned by your API to display its value here.'
      }
    ]
  },
  {
    group: 'Advanced Settings',
    options: [
      {
        key: 'resultKey',
        label: 'Result Key',
        type: 'text',
        tooltip: 'This key must match a field in the API response to show the result here.'
    },

    ]
  }
];
