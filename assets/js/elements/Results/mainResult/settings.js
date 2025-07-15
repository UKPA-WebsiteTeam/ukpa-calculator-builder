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
  },

];
