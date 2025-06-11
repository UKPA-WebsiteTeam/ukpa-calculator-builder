export default [
  {
    group: 'Image Settings',
    options: [
      {
        key: 'url',
        label: 'Image URL',
        type: 'text',
        default: '',
        tooltip: 'The source URL of the image.'
      },
      {
        key: 'altText',
        label: 'Alt Text',
        type: 'text',
        default: '',
        tooltip: 'Alternative text for screen readers or if the image fails to load.'
      }
    ]
  }
];
