export default {
  label: 'Image',
  icon: '🖼️',
  fields: [
    { group: 'Basic Settings', fields: ['url', 'altText'] },
    { group: 'Appearance', fields: ['width', 'height', 'alignment', 'cssClass'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'conditions'] }
  ],
  default: {
    url: '',
    altText: 'Image description',
    width: '100%',
    height: 'auto',
    alignment: 'center',
    cssClass: '',
    tooltip: '',
    conditions: []
  }
};
