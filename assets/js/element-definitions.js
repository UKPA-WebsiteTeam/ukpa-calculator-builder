export const ukpaElementDefinitions = {
  // ======================
  // 🔢 Input Elements
  // ======================
  number: {
    label: 'Number Field',
    icon: '🔢',
    fields: ['label', 'name', 'placeholder', 'min', 'max', 'step', 'conditions'],
    default: {
      label: 'Number Field',
      name: 'Number Field',
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
    fields: ['label', 'name', 'placeholder', 'maxLength', 'conditions'],
    default: {
      label: 'Text Field',
      name: 'Text Field',
      placeholder: 'Enter text',
      maxLength: '100',
      conditions: []
    }
  },

  email: {
    label: 'Email Input',
    icon: '📧',
    fields: ['label', 'name', 'placeholder', 'conditions'],
    default: {
      label: 'Email Field',
      name: 'Email Field',
      placeholder: 'Enter your email',
      conditions: []
    }
  },

  date: {
    label: 'Date Picker',
    icon: '📅',
    fields: ['label', 'name', 'minDate', 'maxDate', 'conditions'],
    default: {
      label: 'Select a date',
      name: 'Date Picker',
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
      name: "Dropdown Selection",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ],
      defaultValue: "yes",
      conditions: []
    },
    fields: ['label', 'name', 'placeholder', 'conditions']
  },

  radio: {
    label: "Radio Group",
    icon: "🔘",
    default: {
      label: "Choose one",
      name: "Radio Group",
      options: [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" }
      ],
      defaultValue: "opt1",
      conditions: []
    },
    fields: ['label', 'name', 'conditions']
  },

  checkbox: {
    label: 'Checkbox / Toggle',
    icon: '☑️',
    fields: ['label', 'name', 'checkedByDefault', 'conditions'],
    default: {
      label: 'Accept terms',
      name: 'Checkbox Label',
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

 // 📊 Result + Logic Elements (updated)
  mainResult: {
    label: 'Main Result',
    icon: '💡',
    fields: ['label', 'resultKey', 'resultDropdownKey', 'conditions'], // 👈 Add this
    default: {
      label: 'Main Result',
      resultKey: 'mainResult',
      resultDropdownKey: '',
      resultOptions: [], // 👈 Needed to render options
      conditions: []
    }
  },
  breakdown: {
    label: 'Breakdown Table',
    icon: '📊',
    fields: ['label', 'resultKey', 'resultDropdownKey', 'conditions'],
    default: {
      label: 'Breakdown',
      resultKey: 'breakdown',
      resultDropdownKey: '',
      resultOptions: [],
      conditions: []
    }
  },
  barChart: {
    label: 'Bar Chart',
    icon: '📈',
    fields: ['label', 'resultKey', 'resultDropdownKey', 'conditions'],
    default: {
      label: 'Chart',
      resultKey: 'chart',
      resultDropdownKey: '',
      resultOptions: [],
      conditions: []
    }
  }
  ,
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
