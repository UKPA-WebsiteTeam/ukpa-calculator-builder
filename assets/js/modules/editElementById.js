import { flattenKeys, flattenScalarKeys } from './flattenKeys.js';
import { getArrayKeys } from './getArrayKeys.js';
import { renderBackendSettings } from './renderBackendSettings.js';

import { renderConditionalLogicEditor } from '../conditional-logic-editor.js';
import { saveElementConfig } from './saveElementConfig.js';
import { renderDropdownEditor } from './editors/dropdownEditor.js';

export function editElementById(id) {
  const el = document.querySelector(`.ukpa-element[data-id="${id}"]`);
  if (!el) return;
  const type = el.dataset.type;

  // Defensive config parsing
  let config;
  try {
    config = JSON.parse(el.dataset.config || '{}');
  } catch (err) {
    console.warn("⚠️ Malformed config for", id, el.dataset.config);
    config = {};
  }

  if (!config || typeof config !== 'object') config = {};
  if (!config.rules) config.rules = [];
  if (!config.conditions) config.conditions = {};

  const def = window.ukpaElementDefinitions?.[type];
  if (!def) return;

  const editorBody = document.getElementById('ukpa-element-editor-body');
  const title = document.getElementById('ukpa-editor-title');
  if (!editorBody || !title) return;

  editorBody.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'ukpa-editor-wrapper';

  if (!(type === 'wrapper' && id === 'secondary-result-wrapper')) {
    const closeBtn = document.createElement('span');
    closeBtn.className = 'ukpa-editor-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Remove Element';
    closeBtn.onclick = () => {
      el.remove();
      editorBody.innerHTML = '<p>Select an element to edit</p>';
    };
    wrapper.appendChild(closeBtn);
  }
  // Admin ID
  const idLabel = document.createElement('div');
  idLabel.className = 'ukpa-admin-id-label';
  idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
  wrapper.appendChild(idLabel);

  // Generic fields
  if (Array.isArray(def.fields) && !def.settings) {
    if (def.fields.includes('label')) {
      const labelId = `${id}-label-input`;
      const labelDiv = document.createElement('div');
      labelDiv.className = 'ukpa-editor-field';

      labelDiv.innerHTML = `
        <label for="${labelId}">Label</label>
        <input type="text" id="${labelId}" class="ukpa-input" value="${config.label || ''}" />
      `;

      const input = labelDiv.querySelector('input');
      input.addEventListener('input', () => {
        config.label = input.value;
        saveConfig();
      });

      wrapper.appendChild(labelDiv);
    }


    if (def.fields.includes('name')) {
      const nameDiv = document.createElement('div');
      nameDiv.className = 'ukpa-editor-field';
      nameDiv.innerHTML = `<label>Backend Label (Name)</label><input type="text" class="ukpa-input" value="${config.name || ''}" />`;
      const input = nameDiv.querySelector('input');
      input.addEventListener('input', () => {
        config.name = input.value;
        saveConfig();
      });
      wrapper.appendChild(nameDiv);
    }

    if (def.fields.includes('placeholder')) {
      const phDiv = document.createElement('div');
      phDiv.className = 'ukpa-editor-field';
      phDiv.innerHTML = `<label>Placeholder</label><input type="text" class="ukpa-input" value="${config.placeholder || ''}" />`;
      const input = phDiv.querySelector('input');
      input.addEventListener('input', () => {
        config.placeholder = input.value;
        saveConfig();
      });
      wrapper.appendChild(phDiv);
    }

    if (def.fields.includes('conditions')) {
      wrapper.appendChild(renderConditionalLogicEditor(config, saveConfig));
    }
  }
  const heading = document.createElement('h3');
  heading.className = 'ukpa-editor-title';
  heading.textContent = `Editing: ${def.label}`;
  wrapper.appendChild(heading);

  // Modular Grouped Settings Support (via def.settings)
  if (Array.isArray(def.settings)) {
    def.settings.forEach(group => {
      const groupWrapper = document.createElement('div');
      groupWrapper.className = 'ukpa-editor-group';

      const groupTitle = document.createElement('h4');
      groupTitle.textContent = group.group;
      groupWrapper.appendChild(groupTitle);

      group.options.forEach(option => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'ukpa-editor-field';
        const value = config[option.key];

        if (option.type === 'optionList') {
          const listDiv = document.createElement('div');
          listDiv.className = 'ukpa-editor-field';
          listDiv.innerHTML = `<h3>${option.label}</h3>`;

          const listWrapper = document.createElement('div');
          listWrapper.className = 'ukpa-option-list';

          function renderOptions() {
            listWrapper.innerHTML = '';
            (config[option.key] || []).forEach((opt, i) => {
              const labelId = `${option.key}-label-${i}`;
              const valueId = `${option.key}-value-${i}`;

              const row = document.createElement('div');
              row.className = 'ukpa-option-row element-settings-dropdown-row';

              row.innerHTML = `
                <label class="ukpa-option-label screen-reader-text" for="${labelId}">Label</label>
                <input type="text" id="${labelId}" class="element-settings-dropdown-options" placeholder="Label" value="${opt.label || ''}" />

                <label class="ukpa-option-label screen-reader-text" for="${valueId}">Value</label>
                <input type="text" id="${valueId}" class="element-settings-dropdown-options" placeholder="Value" value="${opt.value || ''}" />

                <button type="button" class="ukpa-remove-option">✖</button>
              `;

              const [labelInput, valueInput, removeBtn] = row.querySelectorAll('input, button');

              labelInput.addEventListener('input', () => {
                config[option.key][i].label = labelInput.value;
                saveConfig();
              });

              valueInput.addEventListener('input', () => {
                config[option.key][i].value = valueInput.value;
                saveConfig();
              });

              removeBtn.addEventListener('click', () => {
                config[option.key].splice(i, 1);
                renderOptions();
                saveConfig();
              });

              listWrapper.appendChild(row);
            });

            const addBtn = document.createElement('button');
            addBtn.textContent = '➕ Add Option';
            addBtn.type = 'button';
            addBtn.className = 'ukpa-add-option';
            addBtn.addEventListener('click', () => {
              config[option.key].push({ label: '', value: '' });
              renderOptions();
              saveConfig();
            });

            listWrapper.appendChild(addBtn);
          }


          if (!Array.isArray(config[option.key])) config[option.key] = [];
          renderOptions();
          listDiv.appendChild(listWrapper);
          groupWrapper.appendChild(listDiv);
          return; // Prevent further generic rendering for this option
        }


        if (['text', 'number'].includes(option.type)) {
          fieldDiv.innerHTML = `
            <label>
              ${option.label || option.key}
              ${option.tooltip ? `<span class="ukpa-tooltip-icon" title="${option.tooltip}">ℹ️</span>` : ''}
            </label>
            <input type="${option.type}" class="ukpa-input" value="${value ?? option.default ?? ''}" />
          `;
          const input = fieldDiv.querySelector('input');
          input.addEventListener('input', () => {
            config[option.key] = option.type === 'number' ? parseFloat(input.value) : input.value;
            saveConfig();
          });
        }

        if (option.type === 'checkbox') {
          const checked = value === true ? 'checked' : '';
          fieldDiv.innerHTML = `
            <label><input type="checkbox" ${checked} /> ${option.label}</label>
          `;
          const input = fieldDiv.querySelector('input');
          input.addEventListener('change', () => {
            config[option.key] = input.checked;
            saveConfig();
          });
        }

        groupWrapper.appendChild(fieldDiv);
      });

      wrapper.appendChild(groupWrapper);
    });
  }



  const inputTypes = ['number', 'text', 'email', 'dropdown', 'radio', 'checkbox', 'date'];
  if (inputTypes.includes(type)) {
    const requiredDiv = document.createElement('div');
    requiredDiv.className = 'ukpa-editor-field';
    requiredDiv.innerHTML = `
      <label><input type="checkbox" ${config.calcRequired ? 'checked' : ''} /> Required</label>
    `;
    const checkbox = requiredDiv.querySelector('input');
    checkbox.addEventListener('change', () => {
      config.calcRequired = checkbox.checked;
      saveConfig();
    });
    wrapper.appendChild(requiredDiv);
  }

  if (['dropdown', 'radio'].includes(type) && !def.settings) {
    wrapper.appendChild(renderDropdownEditor(config, saveConfig));
  }


  if (type === 'header') {
    const levelDiv = document.createElement('div');
    levelDiv.className = 'ukpa-editor-field';
    levelDiv.innerHTML = `
      <label>Header Level</label>
      <select class="ukpa-input">
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>`;
    const select = levelDiv.querySelector('select');
    select.value = config.level || 'h2';
    select.addEventListener('change', () => {
      config.level = select.value;
      saveConfig();
    });
    wrapper.appendChild(levelDiv);
  }

  if (type === 'image') {
    const imgDiv = document.createElement('div');
    imgDiv.className = 'ukpa-editor-field';
    imgDiv.innerHTML = `<label>Image URL</label><input type="text" class="ukpa-input" value="${config.url || ''}" />`;
    const input = imgDiv.querySelector('input');
    input.addEventListener('input', () => {
      config.url = input.value;
      saveConfig();
    });
    wrapper.appendChild(imgDiv);
  }

  if (type === 'link') {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'ukpa-editor-field';
    linkDiv.innerHTML = `<label>Link URL</label><input type="text" class="ukpa-input" value="${config.href || ''}" />`;
    const input = linkDiv.querySelector('input');
    input.addEventListener('input', () => {
      config.href = input.value;
      saveConfig();
    });
    wrapper.appendChild(linkDiv);
  }


 if (type === 'wrapper' && id === 'secondary-result-wrapper') {
    const layoutModeField = document.createElement('div');
    layoutModeField.className = 'ukpa-editor-field';
    layoutModeField.innerHTML = `
      <label>Layout Mode</label>
      <select class="ukpa-input">
        <option value="full">Full Width (Chart & Other stacked)</option>
        <option value="stacked">Horizontally Stacked (Chart 70% + Other 30%)</option>
      </select>
    `;

    const select = layoutModeField.querySelector('select');
    const validValues = ['full', 'stacked'];
    select.value = validValues.includes(config.layoutMode) ? config.layoutMode : 'full';

    const wrapperEl = document.querySelector(`.ukpa-element[data-id="${id}"]`);
    const container = wrapperEl?.querySelector('.element-container-ukpa');
    if (container) {
      container.classList.remove('ukpa-secondary-layout-full', 'ukpa-secondary-layout-stacked');
      container.classList.add(`ukpa-secondary-layout-${select.value}`);
    }

    select.addEventListener('change', () => {
      config.layoutMode = select.value;
      wrapperEl?.setAttribute('data-config', JSON.stringify(config));
      const inner = wrapperEl?.querySelector('.element-container-ukpa');
      if (inner) {
        inner.classList.remove('ukpa-secondary-layout-full', 'ukpa-secondary-layout-stacked');
        inner.classList.add(`ukpa-secondary-layout-${select.value}`);
      }
      saveConfig();
    });

    wrapper.appendChild(layoutModeField);
  }
  
  if (['barChart', 'otherResult'].includes(type)) {
  const dynamicKeys = window.dynamicResultKeys || [];
  const dynamicField = document.createElement('div');
  dynamicField.className = 'ukpa-editor-field';

  dynamicField.innerHTML = `
    <label for="resultDropdownKey">Dynamic Result Key</label>
    <select name="resultDropdownKey" class="ukpa-input">
      <option value="">-- Select a result key --</option>
      ${dynamicKeys.map(key => `
        <option value="${key}" ${config.resultDropdownKey === key ? 'selected' : ''}>${key}</option>
      `).join('')}
    </select>
  `;

  const select = dynamicField.querySelector('select');
  select.addEventListener('change', () => {
    config.resultDropdownKey = select.value;
    saveConfig();
  });

  wrapper.appendChild(dynamicField);
}


  function saveConfig() {
    saveElementConfig({ el, type, id, config, editElementById });
  }

  wrapper.setAttribute('data-id', id);
  editorBody.appendChild(wrapper);
  renderBackendSettings(id, config);

}

// Fallback to global window
window.editElementById = editElementById;
