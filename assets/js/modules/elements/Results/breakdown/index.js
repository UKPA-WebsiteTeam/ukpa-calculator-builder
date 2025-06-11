export default {
  label: 'Breakdown Table',
  icon: '📊',
  fields: [
    { group: 'Display', fields: ['label', 'dynamicResult', 'showTotal', 'cssClass'] },
    { group: 'Appearance', fields: ['tableStyle', 'fontSize'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'conditions'] }
  ],
  default: {
    label: 'Breakdown',
    dynamicResult: 'breakdown',
    showTotal: true,
    cssClass: '',
    tableStyle: 'striped',
    fontSize: '14px',
    tooltip: '',
    conditions: []
  }
};
