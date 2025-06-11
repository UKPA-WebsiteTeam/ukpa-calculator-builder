export default [
  {
    group: 'Header Settings',
    options: [
      {
        key: 'label',
        label: 'Text',
        type: 'text',
        default: 'Heading Text',
        tooltip: 'Text that will appear as the heading.'
      },
      {
        key: 'level',
        label: 'Header Level',
        type: 'text',
        default: 'h2',
        tooltip: 'e.g., h1, h2, h3, etc.'
      }
    ]
  },
  {
    group: 'Logic',
    options: [
      {
        key: 'conditions',
        label: 'Conditional Rules',
        type: 'conditions',
        default: [],
        tooltip: 'Show this heading only if certain conditions are met.'
      }
    ]
  }
];
