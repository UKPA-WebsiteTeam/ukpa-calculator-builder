//inputs
import renderNumber from './elements/Inputs/number/render.js';
import renderDropdown from './elements/Inputs/dropdown/render.js';
import renderDate from './elements/Inputs/date/render.js';
import renderDateLegacy from './elements/Inputs/dateLegacy/render.js';
import renderCheckbox from './elements/Inputs/checkbox/render.js';
import renderRadio from './elements/Inputs/radio/render.js';
import renderText from './elements/Inputs/text/render.js';
import renderEmail from './elements/Inputs/email/render.js';

//content
import renderHeader from './elements/Contents/header/render.js';
import renderTextBlock from './elements/Contents/textBlock/render.js';
import renderImage from './elements/Contents/image/render.js';
import renderVideo from './elements/Contents/video/render.js';
import renderLink from './elements/Contents/link/render.js';
import renderButton from './elements/Contents/button/render.js';
import renderContentBlock from './elements/Contents/contentBlock/render.js';

//results
import renderMainResult from './elements/Results/mainResult/render.js';
import renderBreakdown from './elements/Results/breakdown/render.js';
import renderBarChart from './elements/Results/barChart/render.js';
import renderOtherResult from './elements/Results/otherResult/render.js';
import renderDisclaimer from './elements/Results/disclaimer/render.js';

//wrapper
import renderWrapper from './elements/Wrappers/wrapper/render.js';

export function generateElementHTML(type, id, config = {}) {
  let html = '';

  const dataAttr = `data-id="${id}" data-name="${config.name || config.label || id}"`;
  const isCalcRequiredAttr = config.calcRequired ? 'data-calc-required="true"' : '';
  const requiredMark = config.calcRequired ? '<span class="ukpa-required-star">*</span>' : '';

  if (type === 'number') {
    html = renderNumber(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'dropdown') {
    html = renderDropdown(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'date') {
    html = renderDate(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'dateLegacy') {
    html = renderDateLegacy(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'checkbox') {
    html = renderCheckbox(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'radio') {
    html = renderRadio(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'text') {
    html = renderText(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'email') {
    html = renderEmail(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }

  //content elements
  else if (type === 'header') {
    html = renderHeader(id, config, { dataAttr });
  }
  else if (type === 'textBlock') {
    html = renderTextBlock(id, config, { dataAttr });
  }
  else if (type === 'image') {
    html = renderImage(id, config, { dataAttr });
  }
  else if (type === 'video') {
    html = renderVideo(id, config, { dataAttr });
  }
  else if (type === 'link') {
    html = renderLink(id, config, { dataAttr });
  }
  else if (type === 'button') {
    html = renderButton(id, config, { dataAttr });
  }
  else if (type === 'contentBlock') {
    html = renderContentBlock(id, config, { dataAttr });
  }
  else if (type === 'disclaimer') {
    html = renderDisclaimer(id, config, { dataAttr });
  }


  //result items
  else if (type === 'mainResult') {
    html = renderMainResult(id, config, { dataAttr, isCalcRequiredAttr, requiredMark });
  }
  else if (type === 'breakdown') {
    html = renderBreakdown(id, config, { dataAttr });
  }
  else if (type === 'barChart') {
    html = renderBarChart(id, config, { dataAttr });
  }
  else if (type === 'otherResult') {
    html = renderOtherResult(id, config, { dataAttr });
  }

  //wrapper 
  else if (type === 'wrapper' && id === 'secondary-result-wrapper') {
    return renderWrapper(id, config);
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