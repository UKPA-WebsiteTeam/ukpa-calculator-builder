export function generateElementHTML(type, id, config = {}) {
  let html = '';

  const dataAttr = `data-id="${id}" data-name="${config.name || config.label || id}"`;

  if (type === 'number' || type === 'text' || type === 'email') {
    html = `<label for="${id}">${config.label || ''}</label>
            <input type="${type}" id="${id}" placeholder="${config.placeholder || ''}" class="ukpa-input" ${dataAttr} />`;
  } else if (type === 'dropdown') {
    const options = (config.options || []).map(opt => `<option>${opt}</option>`).join('');
    html = `<label for="${id}">${config.label || ''}</label>
            <select id="${id}" class="ukpa-input" ${dataAttr}>${options}</select>`;
  } else if (type === 'radio') {
    const radios = (config.options || []).map(opt =>
      `<label><input type="radio" name="${id}" value="${opt}" ${dataAttr}/> ${opt}</label>`
    ).join('');
    html = `<div class="ukpa-radio-group"><strong>${config.label || ''}</strong><br />${radios}</div>`;
  } else if (type === 'checkbox') {
    html = `<label><input type="checkbox" id="${id}" ${dataAttr}/> ${config.label || ''}</label>`;
  } else if (type === 'date') {
    html = `<label for="${id}">${config.label || ''}</label>
            <input type="date" id="${id}" class="ukpa-input" ${dataAttr}/>`;
  } else if (type === 'header') {
    const level = config.level || 'h2';
    html = `<${level}>${config.label || 'Header'}</${level}>`;
  } else if (type === 'textBlock') {
    html = `<p>${config.label || ''}</p>`;
  } else if (type === 'image') {
    html = `<img src="${config.url || ''}" alt="Image Element" />`;
  } else if (type === 'video') {
    html = `<iframe src="${config.url || ''}" frameborder="0" allowfullscreen></iframe>`;
  } else if (type === 'link') {
    html = `<a href="${config.href || '#'}" target="_blank">${config.label || 'Link'}</a>`;
  } else if (type === 'mainResult') {
    html = `
      <div class="ab-main-result-wrapper">
        <div class="ab-main-result-header">
          <div class="ab-main-result-label">${config.label || 'Result'}</div>
          <div class="ab-main-result-value" id="${id}" data-result-key="${config.resultKey || id}">--</div>
        </div>
        <div class="ab-main-result-subtext">Enter contact details below to receive more detailed result in your email.</div>
        <div class="ab-main-result-bar"></div>
        ${generateResultDropdown(config)}
      </div>
    `;
  } else if (type === 'breakdown') {
    html = `
      <div class="ab-breakdown-wrapper">
        <label class="ab-breakdown-label">${config.label || 'Breakdown'}</label>
        <div id="${id}" class="ab-breakdown-table" data-result-key="${config.resultKey || id}">
          <!-- Result rows will be inserted here dynamically -->
        </div>
        ${generateResultDropdown(config)}
      </div>
    `;
  } else if (type === 'barChart') {
    html = `
      <div class="ab-chart-wrapper">
        <canvas id="${id}" class="ab-bar-chart" data-result-key="${config.resultKey || id}"></canvas>
        ${generateResultDropdown(config)}
      </div>
    `;
  } else if (type === 'disclaimer') {
    html = `
      <div class="ab-disclaimer">
        <strong class="ab-disclaimer-label">${config.label || 'Disclaimer'}</strong>
      </div>
    `;
  }

  // ✅ Wrap in outer container with conditional logic support
  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('ukpa-field-wrapper');

  if (config.conditions && Array.isArray(config.conditions.rules)) {
    wrapperEl.classList.add('ukpa-conditional');
    wrapperEl.dataset.conditions = JSON.stringify(config.conditions.rules);
  }

  wrapperEl.innerHTML = html;

  return wrapperEl.outerHTML;

  // 🟡 Local dropdown renderer for result selectors
  function generateResultDropdown(config) {
    const options = config.resultOptions || [];
    const selected = config.resultDropdownKey || '';

    const dropdown = options.map(opt => {
      const isSelected = selected === opt ? 'selected' : '';
      return `<option value="${opt}" ${isSelected}>${opt}</option>`;
    }).join('');

    return `
      <div class="ab-result-selector">
        <label>Choose Result Field:</label>
        <select class="ukpa-result-dropdown dynamic-result-options">${dropdown}</select>
      </div>
    `;
  }
}


export function evaluateConditions(rules = []) {
  return rules.every(rule => {
    const field = document.getElementById(rule.field);
    if (!field) return false;

    const value = field.type === 'checkbox'
      ? field.checked
      : field.value;

    switch (rule.operator) {
      case 'equals': return value == rule.value;
      case 'not_equals': return value != rule.value;
      case 'contains': return String(value).includes(rule.value);
      case 'not_contains': return !String(value).includes(rule.value);
      default: return true;
    }
  });
}

export function applyAllConditions() {
  document.querySelectorAll('.ukpa-conditional').forEach(el => {
    const rules = JSON.parse(el.dataset.conditions || '[]');
    const shouldShow = evaluateConditions(rules);
    el.style.display = shouldShow ? '' : 'none';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("input", () => {
    applyAllConditions();
  });
});
