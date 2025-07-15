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
        tooltip: 'Key from the backend result to display here (e.g. allTypesOfTaxesCalculated)'
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: ['row', 'column'],
        tooltip: 'Display layout: row (side-by-side) or column (stacked)'
      },
      {
        key: 'wrap',
        label: 'Wrap Items',
        type: 'toggle',
        tooltip: 'Allow items to wrap to the next line if they exceed the width (row layout only)'
      },
      {
        key: 'widths',
        label: 'Card Widths (JSON)',
        type: 'code',
        language: 'json',
        tooltip: 'Optional: Set custom widths per item in row layout (e.g. {"nonSavingIncomeTax": "33%", "savingsIncomeTax": "33%"})'
      },

      {
        key: 'prefix',
        label: 'Prefix',
        type: 'text',
        default: '',
        tooltip: 'Text to show before the result (e.g., £, $, Area: )'
      },
      {
        key: 'suffix',
        label: 'Suffix',
        type: 'text',
        default: '',
        tooltip: 'Text to show after the result (e.g., USD, kg, m²)'
      }
    ]
  }
];
