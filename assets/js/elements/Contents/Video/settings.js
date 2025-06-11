export default [
  {
    group: 'Video Settings',
    options: [
      {
        key: 'url',
        label: 'Video URL',
        type: 'text',
        default: '',
        tooltip: 'Embed URL for the video (e.g. YouTube or Vimeo).'
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
