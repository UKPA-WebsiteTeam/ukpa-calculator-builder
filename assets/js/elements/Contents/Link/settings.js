export default [
  {
    group: 'Link Settings',
    options: [
      {
        key: 'label',
        label: 'Link Text',
        type: 'text',
        default: 'Click Here',
        tooltip: 'Text shown for the hyperlink.'
      },
      {
        key: 'url',
        label: 'Link URL',
        type: 'text',
        default: '#',
        tooltip: 'Destination URL that the link will open.'
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
