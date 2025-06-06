import { flattenKeys, flattenScalarKeys } from './flattenKeys.js';
import { getArrayKeys } from './getArrayKeys.js';

import { renderConditionalLogicEditor } from '../conditional-logic-editor.js';
import { saveElementConfig } from './saveElementConfig.js';
import { renderDropdownEditor } from './editors/dropdownEditor.js';

export function editElementById(id) {
  const el = document.querySelector(`.ukpa-element[data-id="${id}"]`);
  if (!el) return;
  console.log("🛠️ editElementById triggered for:", id); 
  const type = el.dataset.type;

  // ✅ Defensive config parsing
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

  const heading = document.createElement('h3');
  heading.className = 'ukpa-editor-title';
  heading.textContent = `Editing: ${def.label}`;
  wrapper.appendChild(heading);

  const idLabel = document.createElement('div');
  idLabel.className = 'ukpa-admin-id-label';
  idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
  wrapper.appendChild(idLabel);

  if (Array.isArray(def.fields) && def.fields.includes('label')) {
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
    <label><input type="checkbox" ${config.calcRequired ? 'checked' : ''} /> Required</label>
  `;
  const checkbox = requiredDiv.querySelector('input');
  checkbox.addEventListener('change', () => {
    config.calcRequired = checkbox.checked;
    saveConfig();
  });
  wrapper.appendChild(requiredDiv);

  if (Array.isArray(def.fields) && def.fields.includes('name')) {
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

  if (Array.isArray(def.fields) && def.fields.includes('placeholder')) {
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

  if (Array.isArray(def.fields) && def.fields.includes('conditions')) {
    wrapper.appendChild(renderConditionalLogicEditor(config, saveConfig));
  }

  const resultTypes = ['mainResult', 'breakdown', 'barChart','otherResult'];

  if (resultTypes.includes(type)) {
    let resultKeys = [];

    if (window.ukpaResults && typeof window.ukpaResults === 'object') {
      if (type === 'mainResult') {
        resultKeys = flattenScalarKeys(window.ukpaResults);
      } else {
        resultKeys = getArrayKeys(window.ukpaResults);
      }
      window.ukpaResultKeys = resultKeys;
    }

    const dynamicGroup = document.createElement("div");
    dynamicGroup.className = "ukpa-editor-field";

    const dynamicLabel = document.createElement("label");
    dynamicLabel.textContent = "Dynamic Result Value:";

    const dynamicSelect = document.createElement("select");
    dynamicSelect.className = "ukpa-input dynamic-result-options ukpa-element";
    dynamicSelect.id = "ukpa-dynamic-result";
    dynamicSelect.innerHTML = `<option value="">-- Select --</option>`;

    resultKeys.forEach(key => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key;
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

  if (type === 'secondaryWrapper') {
    const layoutField = document.createElement('div');
    layoutField.className = 'ukpa-editor-field';
    layoutField.innerHTML = `
      <label>Layout</label>
      <select class="ukpa-input">
        <option value="row">Row</option>
        <option value="column">Column</option>
      </select>
    `;
    const layoutSelect = layoutField.querySelector('select');
    layoutSelect.value = config.layout || 'row';
    layoutSelect.addEventListener('change', () => {
      config.layout = layoutSelect.value;
      saveConfig();
    });
    wrapper.appendChild(layoutField);

    const wrapField = document.createElement('div');
    wrapField.className = 'ukpa-editor-field';
    wrapField.innerHTML = `
      <label><input type="checkbox" ${config.wrap !== 'no-wrap' ? 'checked' : ''} /> Enable wrapping</label>
    `;
    const wrapCheckbox = wrapField.querySelector('input');
    wrapCheckbox.addEventListener('change', () => {
      config.wrap = wrapCheckbox.checked ? 'wrap' : 'no-wrap';
      saveConfig();
    });
    wrapper.appendChild(wrapField);

    const widthsField = document.createElement('div');
    widthsField.className = 'ukpa-editor-field';
    widthsField.innerHTML = `
      <label>Column Widths (optional)</label>
      <textarea class="ukpa-input" rows="4" placeholder='e.g. {"result1": "30%", "result2": "70%"}'></textarea>
    `;
    const textarea = widthsField.querySelector('textarea');
    textarea.value = JSON.stringify(config.widths || {}, null, 2);
    textarea.addEventListener('input', () => {
      try {
        config.widths = JSON.parse(textarea.value);
        textarea.classList.remove('ukpa-error');
        saveConfig();
      } catch {
        textarea.classList.add('ukpa-error');
      }
    });
    wrapper.appendChild(widthsField);
  }

  function saveConfig() {
    saveElementConfig({ el, type, id, config, editElementById });
  }

  wrapper.setAttribute('data-id', id);
  editorBody.appendChild(wrapper);
}

// Optional global fallback
window.editElementById = editElementById;
