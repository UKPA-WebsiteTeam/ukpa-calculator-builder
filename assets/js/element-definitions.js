export const ukpaElementDefinitions = {
  // ======================
  // 🔢 Input Elements
  // ======================
  number: {
    label: 'Number Field',
    icon: '🔢',
    fields: ['label', 'placeholder', 'min', 'max', 'step', 'conditions'],
    default: {
      label: 'Number Field',
      placeholder: 'Enter number',
      min: '',
      max: '',
      step: '1',
      conditions: []
    }
  },

  text: {
    label: 'Text Field',
    icon: '🔤',
    fields: ['label', 'placeholder', 'maxLength', 'conditions'],
    default: {
      label: 'Text Field',
      placeholder: 'Enter text',
      maxLength: '100',
      conditions: []
    }
  },

  email: {
    label: 'Email Input',
    icon: '📧',
    fields: ['label', 'placeholder', 'conditions'],
    default: {
      label: 'Email Field',
      placeholder: 'Enter your email',
      conditions: []
    }
  },

  date: {
    label: 'Date Picker',
    icon: '📅',
    fields: ['label', 'minDate', 'maxDate', 'conditions'],
    default: {
      label: 'Select a date',
      minDate: '',
      maxDate: '',
      conditions: []
    }
  },

  dropdown: {
    label: "Dropdown",
    icon: "⬇️",
    default: {
      label: "Select an option",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ],
      defaultValue: "yes"
    },
    fields: ['label', 'placeholder', 'conditions']
  },

  radio: {
    label: "Radio Group",
    icon: "🔘",
    default: {
      label: "Choose one",
      options: [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" }
      ],
      defaultValue: "opt1"
    },
    fields: ['label', 'conditions']
  }
  ,

  checkbox: {
    label: 'Checkbox / Toggle',
    icon: '☑️',
    fields: ['label', 'checkedByDefault', 'conditions'],
    default: {
      label: 'Accept terms',
      checkedByDefault: false,
      conditions: []
    }
  },

  // ======================
  // 📦 Content Elements
  // ======================
  header: {
    label: 'Heading',
    icon: '🔠',
    fields: ['label', 'level', 'conditions'],
    default: {
      label: 'Heading Text',
      level: 'h2',
      conditions: []
    }
  },

  textBlock: {
    label: 'Text Block',
    icon: '📝',
    fields: ['label', 'conditions'],
    default: {
      label: 'This is a block of text.',
      conditions: []
    }
  },

  image: {
    label: 'Image',
    icon: '🖼️',
    fields: ['url', 'altText', 'conditions'],
    default: {
      url: '',
      altText: '',
      conditions: []
    }
  },

  video: {
    label: 'Video Embed',
    icon: '🎥',
    fields: ['url', 'conditions'],
    default: {
      url: '',
      conditions: []
    }
  },

  link: {
    label: 'Hyperlink',
    icon: '🔗',
    fields: ['label', 'url', 'conditions'],
    default: {
      label: 'Click Here',
      url: '#',
      conditions: []
    }
  },

  button: {
    label: 'Button',
    icon: '🖱️',
    fields: ['label', 'action', 'conditions'],
    default: {
      label: 'Submit',
      action: 'submit',
      conditions: []
    }
  },

  contentBlock: {
    label: 'Content Block',
    icon: '📦',
    fields: ['label', 'html', 'conditions'],
    default: {
      label: 'Content Block',
      html: '<p>Custom HTML content here.</p>',
      conditions: []
    }
  },

  // ======================
  // 📊 Result + Logic Elements
  // ======================
  mainResult: {
    label: 'Main Result',
    icon: '💡',
    fields: ['label', 'resultKey', 'conditions'],
    default: {
      label: 'Main Result',
      resultKey: 'mainResult',
      conditions: []
    }
  },
  barChart: {
    label: '',
    icon: '📈',
    fields: ['label', 'resultKey', 'conditions'],
    default: {
      label: '',
      resultKey: 'barChart',
      conditions: []
    }
  },

  breakdown: {
    label: 'Breakdown Table',
    icon: '📊',
    fields: ['label', 'resultKey', 'conditions'],
    default: {
      label: 'Breakdown',
      resultKey: 'breakdown',
      conditions: []
    }
  },

  disclaimer: {
    label: 'Disclaimer',
    icon: '⚠️',
    fields: ['label', 'text', 'conditions'],
    default: {
      label: 'Disclaimer',
      conditions: []
    }
  }
};
