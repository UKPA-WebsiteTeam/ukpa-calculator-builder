export default [
  {
    group: 'Other Result Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        tooltip: 'Label shown above the value'
      },
      {
        key: 'resultDropdownKey',
        label: 'Result Key',
        type: 'text',
        tooltip: 'Key from the backend result to display here'
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: ['row', 'column'],
        tooltip: 'Display layout: row (inline) or column (stacked)'
      }
    ]
  }
];
