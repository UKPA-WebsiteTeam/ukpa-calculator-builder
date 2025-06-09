export function generateElementHTML(type, id, config = {}) {
  let html = '';

  const dataAttr = `data-id="${id}" data-name="${config.name || config.label || id}"`;
  const isCalcRequiredAttr = config.calcRequired ? 'data-calc-required="true"' : '';
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';

  if (['number', 'text', 'email'].includes(type)) {
    html = `<label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input type="${type}" id="${id}" placeholder="${config.placeholder || ''}" class="ukpa-input" ${dataAttr} ${isCalcRequiredAttr} />`;
  }

  else if (type === 'dropdown') {
    const options = (config.options || []).map(opt => {
      const label = typeof opt === 'object' ? opt.label : opt;
      const value = typeof opt === 'object' ? opt.value : opt;
      const selected = config.value === value || config.dynamicResult === value ? 'selected' : '';
      return `<option value="${value}" ${selected}>${label}</option>`;
    }).join('');

    html = `<label for="${id}">${config.label || ''} ${requiredMark}</label>
    <select id="${id}" class="ukpa-input" ${dataAttr} ${isCalcRequiredAttr}>
      ${options}
    </select>`;
  }

  else if (type === 'radio') {
    const radios = (config.options || []).map(opt => {
      const label = typeof opt === 'object' ? opt.label : opt;
      const value = typeof opt === 'object' ? opt.value : opt;
      return `<label><input type="radio" name="${id}" value="${value}" ${dataAttr} ${isCalcRequiredAttr}/> ${label}</label>`;
    }).join('');
    html = `<div class="ukpa-radio-group"><strong>${config.label || ''} ${requiredMark}</strong><br />${radios}</div>`;
  }

  else if (type === 'checkbox') {
    html = `<label><input type="checkbox" id="${id}" ${dataAttr} ${isCalcRequiredAttr}/> ${config.label || ''}</label>`;
  }

  else if (type === 'date') {
    html = `<label for="${id}">${config.label || ''} ${requiredMark}</label>
    <input type="date" id="${id}" class="ukpa-input" ${dataAttr} ${isCalcRequiredAttr} />`;
  }

  else if (type === 'header') {
    const level = config.level || 'h2';
    html = `<${level}>${config.label || 'Header'}</${level}>`;
  }

  else if (type === 'textBlock') {
    html = `<p>${config.label || ''}</p>`;
  }

  else if (type === 'image') {
    html = `<img src="${config.url || ''}" alt="Image Element" />`;
  }

  else if (type === 'video') {
    html = `<iframe src="${config.url || ''}" frameborder="0" allowfullscreen></iframe>`;
  }

  else if (type === 'link') {
    html = `<a href="${config.href || '#'}" target="_blank">${config.label || 'Link'}</a>`;
  }

  else if (type === 'mainResult') {
    const key = config.dynamicResult || '';
    html = `
      <div class="ab-main-result">
        <span class="ab-result-label">${config.label || 'Main Result'}</span>
        <div class="ab-main-result-value" data-key="${key}">--</div>
      </div>
    `;
  }

  else if (type === 'breakdown') {
    html = `
      <div class="ab-breakdown-wrapper">
        <label class="ab-breakdown-label">${config.label || 'Breakdown'}</label>
        <div id="${id}" class="ab-breakdown-table" data-result-key="${config.dynamicResult || 'breakdown'}">
          <!-- Result rows will be inserted dynamically -->
        </div>
      </div>`;
  }

  else if (type === 'barChart') {
    html = `
      <div class="ab-chart-wrapper">
        <canvas id="${id}" style="width:100px;" class="ab-bar-chart" data-result-key="${config.dynamicResult || 'breakdown'}"></canvas>
      </div>`;
  }

  else if (type === 'disclaimer') {
    html = `
      <div class="ab-disclaimer">
        <strong class="ab-disclaimer-label">${config.label || 'Disclaimer'}</strong>
      </div>`;
  }

  else if (type === 'otherResult') {
    const key = config.dynamicResult || '';
    const layoutClass = config.layout === 'column' ? 'ab-other-block' : 'ab-other-inline';

    html = `
      <div class="ab-other-result other-section ${layoutClass}" data-key="${key}" data-layout="${config.layout || 'row'}">
        <div class="ab-other-label">${config.label || 'Other Result'}</div>
        <div class="ab-other-value">--</div>
      </div>`;
  }

  if (type === 'wrapper' && id === 'secondary-result-wrapper') {
    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('ukpa-element');
    wrapperEl.setAttribute('data-id', id);
    wrapperEl.setAttribute('data-type', 'wrapper');
    wrapperEl.setAttribute('data-config', JSON.stringify(config));
    wrapperEl.setAttribute('draggable', 'true');

    // Determine layout class
    const layoutMode = config.layoutMode || 'full';
    const layoutClass = layoutMode === 'stacked'
      ? 'ukpa-secondary-layout-stacked'
      : 'ukpa-secondary-layout-full';

    // Build the wrapper HTML with layout class on element-container-ukpa
    wrapperEl.innerHTML = `
      <div class="ukpa-admin-id-label ukpa-editable-wrapper-label">
        🧩 <strong>${config.label || 'Secondary Result Wrapper'}</strong>
      </div>
      <div class="ukpa-drop-zone"
          id="secondary-result-zone"
          data-allowed="barChart,otherResult"
          data-section="results">
        <h4>Other Results & Charts</h4>
        <div class="element-container-ukpa ${layoutClass}"></div>
      </div>
    `;

    // Preserve children
    const oldDropZone = document.querySelector(`[data-id="${id}"] .ukpa-drop-zone`);
    const newContainer = wrapperEl.querySelector('.element-container-ukpa');

    if (oldDropZone && newContainer) {
      const oldContainer = oldDropZone.querySelector('.element-container-ukpa') || oldDropZone;

      Array.from(oldContainer.children).forEach(child => {
        if (child.classList.contains('ukpa-element')) {
          const cloned = child.cloneNode(true);
          cloned.setAttribute('draggable', 'true');
          newContainer.appendChild(cloned);
        }
      });
    }

    return wrapperEl;
  }




  // ✅ For normal elements
  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('ukpa-field-wrapper');

  if (config.conditions && Array.isArray(config.conditions.rules)) {
    wrapperEl.classList.add('ukpa-conditional');
    wrapperEl.dataset.conditions = JSON.stringify(config.conditions.rules);
  }

  wrapperEl.innerHTML = html;

  if (window.ukpaBuilderMode) {
    if (id !== 'secondary-result-wrapper') {
      const idLabel = document.createElement('div');
      idLabel.className = 'ukpa-admin-id-label';
      idLabel.innerHTML = `🆔 <strong>${id}</strong>`;
      wrapperEl.prepend(idLabel);
    }

    if (!(type === 'wrapper' && id === 'secondary-result-wrapper')) {
      const closeBtn = document.createElement('span');
      closeBtn.className = 'ukpa-element-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.title = 'Delete Element';

      closeBtn.onclick = e => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this element?')) {
          const element = document.querySelector(`.ukpa-element[data-id="${id}"]`);
          if (element) {
            const column = element.closest('.ukpa-column');
            const row = column?.closest('.ukpa-row');
            element.remove();

            if (column && column.querySelectorAll('.ukpa-element').length === 0) {
              column.remove();
            }

            removeEmptyColumnsAndRows(document.querySelector('.ukpa-drop-zone'));
            window.markAsDirty?.();
          }
        }
      };

      wrapperEl.appendChild(closeBtn);
    }
  }

  return wrapperEl;
}


export function evaluateConditions(rules = []) {
  return rules.every(rule => {
    const field = document.getElementById(rule.field);
    if (!field) return false;

    const value = field.type === 'checkbox' ? field.checked : field.value;

    switch (rule.operator) {
      case 'equals': return value == rule.value;
      case 'not_equals': return value != rule.value;
      case 'contains': return String(value).includes(rule.value);
      case 'not_contains': return !String(value).includes(rule.value);
      default: return true;
    }
  });
}

// ✅ Apply all conditions globally
export function applyAllConditions() {
  document.querySelectorAll('.ukpa-conditional').forEach(el => {
    const rules = JSON.parse(el.dataset.conditions || '[]');
    const shouldShow = evaluateConditions(rules);
    el.style.display = shouldShow ? '' : 'none';
  });
}

// ✅ Auto-apply on page load + when any input changes
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("input", applyAllConditions);
});
