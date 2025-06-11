export default {
  label: 'Disclaimer',
  icon: '⚠️',
  fields: [
    { group: 'Content', fields: ['label'] },
    { group: 'Style', fields: ['textAlign', 'backgroundColor', 'textColor', 'padding', 'borderRadius'] },
    { group: 'Advanced Settings', fields: ['cssClass', 'tooltip', 'conditions'] }
  ],
  default: {
    label: 'This calculator is for illustrative purposes only.',
    textAlign: 'left',
    backgroundColor: '#fff8e1',
    textColor: '#333',
    padding: '12px',
    borderRadius: '6px',
    cssClass: '',
    tooltip: '',
    conditions: []
  }
};
