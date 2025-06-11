export default {
  label: 'Video',
  icon: '🎬',
  fields: [
    { group: 'Basic Settings', fields: ['url'] },
    { group: 'Appearance', fields: ['width', 'height', 'alignment', 'cssClass'] },
    { group: 'Advanced Settings', fields: ['tooltip', 'autoplay', 'controls', 'loop', 'conditions'] }
  ],
  default: {
    url: '',
    width: '100%',
    height: '300px',
    alignment: 'center',
    cssClass: '',
    tooltip: '',
    autoplay: false,
    controls: true,
    loop: false,
    conditions: []
  }
};
