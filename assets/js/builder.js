// ✅ Module Imports
import { addElementToBuilder } from './modules/addElementToBuilder.js';
import { initAdvancedSortable } from './modules/initAdvancedSortable.js'; // ✅ Only advanced sortable now
import { saveCalculatorLayout } from './modules/saveCalculatorLayout.js';
import { toggleBox } from './modules/toggleBox.js';
import { injectTestApiButton } from './modules/injectTestApiButton.js';
import { renderResults } from './shared/render-results.js';
import { renderSavedLayout } from './modules/renderSavedLayout.js';

window.renderResults = renderResults;

import { editElementById } from './modules/editElementById.js';
import { ukpaElementDefinitions } from './element-definitions.js';
import { generateElementHTML } from './generateElementHTML.js';

window.editElementById = editElementById;
window.ukpaElementDefinitions = ukpaElementDefinitions;
window.generateElementHTML = generateElementHTML;

// ✅ Global assignments
window.draggingElement = null;
window.isDirty = false;
window.toggleBox = toggleBox;
window.cssEditor = null;
window.jsEditor = null;

// ✅ Main DOM Ready block
document.addEventListener('DOMContentLoaded', () => {
  // ✅ Calculator ID
  window.ukpaCalculatorId = new URLSearchParams(window.location.search).get('calc_id');

  // ✅ Render saved layout — pass elements explicitly for new calculators
  const initialElements = window.ukpa_calc_data?.elements || [];
  renderSavedLayout(initialElements); // ✅ Fix: ensure elements are passed!

  // ✅ Save button setup
  const saveBtn = document.getElementById('ukpa-save-builder');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCalculatorLayout);
    injectTestApiButton(saveBtn);
  } else {
    console.warn("❌ Save button not found, cannot inject Test API button");
  }

  // ✅ Ctrl+S / Cmd+S to save
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveCalculatorLayout();
    }
  });

  // ✅ Warn on unsaved exit
  const exitBtn = document.querySelector(".ukpa-builder-exit");
  if (exitBtn) {
    exitBtn.addEventListener("click", function (e) {
      if (window.isDirty) {
        const confirmed = confirm("⚠️ You have unsaved changes. Are you sure you want to exit?");
        if (!confirmed) e.preventDefault();
      }
    });
  }

  // ✅ CodeMirror for CSS
  const cssTextarea = document.getElementById('ukpa_custom_css');
  if (cssTextarea && typeof CodeMirror !== 'undefined') {
    window.cssEditor = CodeMirror.fromTextArea(cssTextarea, {
      lineNumbers: true,
      mode: 'css',
      theme: 'default',
    });
    if (window.ukpa_calc_data?.custom_css) {
      window.cssEditor.setValue(window.ukpa_calc_data.custom_css);
    }
  }

  // ✅ CodeMirror for JS
  const jsTextarea = document.getElementById('ukpa_custom_js');
  if (jsTextarea && typeof CodeMirror !== 'undefined') {
    window.jsEditor = CodeMirror.fromTextArea(jsTextarea, {
      lineNumbers: true,
      mode: 'javascript',
      theme: 'default',
    });
    if (window.ukpa_calc_data?.custom_js) {
      window.jsEditor.setValue(window.ukpa_calc_data.custom_js);
    }
  }

  // ✅ Init advanced sortable system
  initAdvancedSortable();
});
