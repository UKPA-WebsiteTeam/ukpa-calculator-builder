export default {
  label: 'Other Result',
  icon: '🧾',
  fields: [
    { group: 'Display', fields: ['label', 'dynamicResult', 'prefix', 'suffix', 'layout'] },
    { group: 'Style', fields: ['cssClass', 'fontSize', 'backgroundColor', 'textColor'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'conditions'] }
  ],
  default: {
    label: 'Other Result',
    dynamicResult: '',
    prefix: '',
    suffix: '',
    layout: 'row',
    cssClass: '',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
    textColor: '#000',
    tooltip: '',
    conditions: []
  }
};
