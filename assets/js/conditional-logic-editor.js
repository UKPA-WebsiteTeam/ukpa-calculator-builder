export function renderConditionalLogicEditor(config, saveFn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ukpa-editor-field';
  wrapper.innerHTML = `<label>Conditional Logic</label>`;

  if (!config.conditions || typeof config.conditions !== 'object') {
    config.conditions = {
      logic: 'AND',
      rules: []
    };
  }

  const conditionUI = document.createElement('div');
  conditionUI.className = 'ukpa-logic-builder';

  const logicToggle = document.createElement('select');
  logicToggle.innerHTML = `
    <option value="AND">Show if ALL rules match (AND)</option>
    <option value="OR">Show if ANY rule matches (OR)</option>
  `;
  logicToggle.value = config.conditions.logic || 'AND';
  logicToggle.addEventListener('change', () => {
    config.conditions.logic = logicToggle.value;
    saveFn();
  });

  conditionUI.appendChild(logicToggle);

  const rulesList = document.createElement('div');
  rulesList.className = 'ukpa-rules-list';

  const renderRules = () => {
    if (!config.conditions || !Array.isArray(config.conditions.rules)) {
      config.conditions = { rules: [] };
    }
    rulesList.innerHTML = '';

    config.conditions.rules.forEach((rule, index) => {
      const row = document.createElement('div');
      row.className = 'ukpa-rule-row';

      const fieldInput = document.createElement('input');
      fieldInput.className = 'ukpa-input';
      fieldInput.placeholder = 'Field ID';
      fieldInput.value = rule.field || '';

      const operatorSelect = document.createElement('select');
      ['equals', 'not_equals', 'in', 'not_in'].forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        if (rule.operator === op) opt.selected = true;
        operatorSelect.appendChild(opt);
      });

      const valueInput = document.createElement('input');
      valueInput.className = 'ukpa-input';
      valueInput.placeholder = 'Value (comma for multiple)';
      valueInput.value = Array.isArray(rule.value) ? rule.value.join(',') : rule.value;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '🗑';
      removeBtn.className = 'ukpa-btn-remove-option';
      removeBtn.onclick = () => {
        config.conditions.rules.splice(index, 1);
        renderRules();
        saveFn();
      };

      fieldInput.addEventListener('input', () => {
        rule.field = fieldInput.value.trim();
        saveFn();
      });

      operatorSelect.addEventListener('change', () => {
        rule.operator = operatorSelect.value;
        saveFn();
      });

      valueInput.addEventListener('input', () => {
        rule.value = operatorSelect.value.includes('in')
          ? valueInput.value.split(',').map(v => v.trim())
          : valueInput.value.trim();
        saveFn();
      });

      row.appendChild(fieldInput);
      row.appendChild(operatorSelect);
      row.appendChild(valueInput);
      row.appendChild(removeBtn);

      rulesList.appendChild(row);
    });
  };

  renderRules();

  const addRuleBtn = document.createElement('button');
  addRuleBtn.type = 'button';
  addRuleBtn.textContent = '➕ Add Rule';
  addRuleBtn.className = 'ukpa-btn-add-option';
  addRuleBtn.onclick = () => {
    config.conditions.rules.push({
      field: '',
      operator: 'equals',
      value: ''
    });
    renderRules();
    saveFn();
  };

  wrapper.appendChild(conditionUI);
  wrapper.appendChild(rulesList);
  wrapper.appendChild(addRuleBtn);

  return wrapper;
}
