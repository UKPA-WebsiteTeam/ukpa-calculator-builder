export default {
  label: 'Bar Chart',
  icon: '📶',
  fields: [
    { group: 'Data Source', fields: ['dynamicResult'] },
    { group: 'Chart Settings', fields: ['chartHeight', 'showLegend', 'showGrid', 'barColor'] },
    { group: 'Styling', fields: ['cssClass', 'marginTop', 'marginBottom'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'conditions'] }
  ],
  default: {
    dynamicResult: 'breakdown',
    chartHeight: '250px',
    showLegend: true,
    showGrid: true,
    barColor: '#4A90E2',
    cssClass: '',
    marginTop: '10px',
    marginBottom: '10px',
    tooltip: '',
    conditions: []
  }
};
