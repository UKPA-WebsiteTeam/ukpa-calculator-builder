export default [
  {
    group: 'Layout Settings',
    options: [
      {
        key: 'layout',
        label: 'Layout Type',
        type: 'select',
        options: ['wrap', 'row', 'column'],
        tooltip: 'Defines how the inner items are arranged.'
      },
      {
        key: 'layoutMode',
        label: 'Layout Mode',
        type: 'select',
        options: [
          'Full Width (Chart & Other stacked)',
          'Stacked (Chart 70% + Other 30%)'
        ],
        tooltip: 'Visual mode of Chart and Other Results.'
      },
      {
        key: 'gap',
        label: 'Gap Between Items',
        type: 'text',
        placeholder: 'e.g. 10px or 1rem',
        tooltip: 'Spacing between the elements inside.'
      },
      {
        key: 'columnWidths.left',
        label: 'Chart Section Width',
        type: 'text',
        placeholder: 'e.g. 60%',
        tooltip: 'Width of the chart container.'
      },
      {
        key: 'columnWidths.right',
        label: 'Other Results Width',
        type: 'text',
        placeholder: 'e.g. 40%',
        tooltip: 'Width of the other results container.'
      }
    ]
  }
];
