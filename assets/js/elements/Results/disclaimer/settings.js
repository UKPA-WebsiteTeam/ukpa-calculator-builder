export default [
  {
    group: 'Disclaimer Settings',
    options: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        default: 'Disclaimer',
        tooltip: 'Label shown before the disclaimer text.'
      },
      {
        key: 'text',
        label: 'Disclaimer Text',
        type: 'text',
        default: '',
        tooltip: 'Actual content of the disclaimer.'
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
