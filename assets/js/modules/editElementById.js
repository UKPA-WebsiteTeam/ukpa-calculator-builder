import { flattenKeys, flattenScalarKeys } from './flattenKeys.js';
import { getArrayKeys } from './getArrayKeys.js';

import { renderConditionalLogicEditor } from '../conditional-logic-editor.js';
import { saveElementConfig } from './saveElementConfig.js';

export function editElementById(id) {
  const el = document.querySelector(`.ukpa-element[data-id="${id}"]`);
  if (!el) return;

  const type = el.dataset.type;
  const config = JSON.parse(el.dataset.config || '{}');
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

  const closeBtn = document.createElement('span');
  closeBtn.className = 'ukpa-editor-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Remove Element';
  closeBtn.onclick = () => {
    el.remove();
    editorBody.innerHTML = '<p>Select an element to edit</p>';
  };
  wrapper.appendChild(closeBtn);

  const heading = document.createElement('h3');
  heading.className = 'ukpa-editor-title';
  heading.textContent = `Editing: ${def.label}`;
  wrapper.appendChild(heading);

  if (def.fields.includes('label')) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'ukpa-editor-field';
    labelDiv.innerHTML = `<label>Label</label><input type="text" class="ukpa-input" value="${config.label || ''}" />`;
    const input = labelDiv.querySelector('input');
    input.addEventListener('input', () => {
      config.label = input.value;
      saveConfig();
    });
    wrapper.appendChild(labelDiv);
  }
  const requiredDiv = document.createElement('div');
  requiredDiv.className = 'ukpa-editor-field';
  requiredDiv.innerHTML = `
    <label><input type="checkbox" ${config.required ? 'checked' : ''} /> Required</label>
  `;
  const checkbox = requiredDiv.querySelector('input');
  checkbox.addEventListener('change', () => {
    config.required = checkbox.checked;
    saveConfig();
  });
  wrapper.appendChild(requiredDiv);

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

  if (['dropdown', 'radio'].includes(type)) {
    const optWrapper = document.createElement('div');
    optWrapper.className = 'ukpa-editor-field';
    optWrapper.innerHTML = `<label>Options</label>`;

    const list = document.createElement('div');
    list.className = 'ukpa-options-list';

    const renderOptions = () => {
      list.innerHTML = '';
      (config.options || []).forEach((val, index) => {
        const row = document.createElement('div');
        row.className = 'ukpa-option-row';

        const input = document.createElement('input');
        input.className = 'ukpa-input';
        input.type = 'text';
        input.placeholder = `Option ${index + 1}`;
        input.value = val;

        input.addEventListener('input', () => {
          config.options[index] = input.value;
          saveConfig();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ukpa-btn-remove-option';
        remove.innerHTML = '<span class="icon">🗑</span>';
        remove.title = 'Remove Option';
        remove.onclick = () => {
          config.options.splice(index, 1);
          renderOptions();
          saveConfig();
        };

        row.appendChild(input);
        row.appendChild(remove);
        list.appendChild(row);
      });
    };

    renderOptions();

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'ukpa-btn-add-option';
    addBtn.innerHTML = '<span class="icon">➕</span> Add Option';
    addBtn.onclick = () => {
      config.options = config.options || [];
      config.options.push('');
      renderOptions();
      saveConfig();
    };

    optWrapper.appendChild(list);
    optWrapper.appendChild(addBtn);
    wrapper.appendChild(optWrapper);
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

  if (def.fields.includes('conditions')) {
    wrapper.appendChild(renderConditionalLogicEditor(config, saveConfig));
  }

  const resultTypes = ['mainResult', 'breakdown', 'barChart','otherResult'];

  if (resultTypes.includes(type)) {
    let resultKeys = [];

    if (window.ukpaResults && typeof window.ukpaResults === 'object') {
      if (type === 'mainResult') {
        // ✅ Only scalar values (string, number, null)
        resultKeys = flattenScalarKeys(window.ukpaResults);
      } else {
        // ✅ Only array keys like breakdown, etc.
        resultKeys = getArrayKeys(window.ukpaResults);
      }

      // Save for future use
      window.ukpaResultKeys = resultKeys;
    }

    const dynamicGroup = document.createElement("div");
    dynamicGroup.className = "ukpa-editor-field";

    const dynamicLabel = document.createElement("label");
    dynamicLabel.textContent = "Dynamic Result Value:";

    const dynamicSelect = document.createElement("select");
    dynamicSelect.className = "ukpa-input dynamic-result-options ukpa-element";
    dynamicSelect.id = "ukpa-dynamic-result";

    // Add default option
    dynamicSelect.innerHTML = `<option value="">-- Select --</option>`;

    resultKeys.forEach(key => {
      const opt = document.createElement("option");
      opt.value = key;                  // ✅ actual usable key
      opt.textContent = key;            // shown label
      if (config.dynamicResult === key) opt.selected = true;
      dynamicSelect.appendChild(opt);
    });

    dynamicSelect.addEventListener("change", () => {
      config.dynamicResult = dynamicSelect.value;
      saveConfig();
    });

    dynamicGroup.appendChild(dynamicLabel);
    dynamicGroup.appendChild(dynamicSelect);
    wrapper.appendChild(dynamicGroup);
}

function saveConfig() {
  saveElementConfig({ el, type, id, config, editElementById });
}


  wrapper.setAttribute('data-id', id);
  editorBody.appendChild(wrapper);
}

// Optional global fallback
window.editElementById = editElementById;
