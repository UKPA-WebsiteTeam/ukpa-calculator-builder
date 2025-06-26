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
      },
      {
        key: 'chartWidth',
        label: 'Chart Width',
        type: 'text',
        placeholder: 'e.g. 100% or 500px',
        tooltip: 'Width of the chart container (e.g. 100%, 500px)',
       },
       {
        key: 'chartHeight',
        label: 'Chart Height',
        type: 'text',
        placeholder: 'e.g. 250px or 400px',
        tooltip: 'Height of the chart container (e.g. 250px)',
        },

    ]
  }
];
