export function renderDropdownEditor(config, saveConfig) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ukpa-editor-field';
  wrapper.innerHTML = `<label>Options</label>`;

  const list = document.createElement('div');
  list.className = 'ukpa-options-list';

  const renderOptions = () => {
    list.innerHTML = '';
    (config.options || []).forEach((val, index) => {
      const row = document.createElement('div');
      row.className = 'ukpa-option-row';

      const labelInput = document.createElement('input');
      labelInput.className = 'ukpa-input';
      labelInput.type = 'text';
      labelInput.placeholder = 'Label';
      labelInput.value = (typeof val === 'object' ? val.label : val) || '';

      const valueInput = document.createElement('input');
      valueInput.className = 'ukpa-input';
      valueInput.type = 'text';
      valueInput.placeholder = 'Value';
      valueInput.value = (typeof val === 'object' ? val.value : val) || '';

      labelInput.addEventListener('input', () => {
        config.options[index] = {
          label: labelInput.value,
          value: valueInput.value
        };
        saveConfig();
      });

      valueInput.addEventListener('input', () => {
        config.options[index] = {
          label: labelInput.value,
          value: valueInput.value
        };
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

      row.appendChild(labelInput);
      row.appendChild(valueInput);
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

  wrapper.appendChild(list);
  wrapper.appendChild(addBtn);
  return wrapper;
}
