// ✅ Module Imports
import { addElementToBuilder } from './modules/addElementToBuilder.js';
import { initSortable } from './modules/initSortable.js';
import { saveCalculatorLayout } from './modules/saveCalculatorLayout.js';
import { markAsDirty } from './modules/markAsDirty.js';
import { registerElementEvents } from './modules/registerElementEvents.js';
import { toggleBox } from './modules/toggleBox.js';
import { injectTestApiButton } from './modules/injectTestApiButton.js';
import { renderResults } from './shared/render-results.js';
window.renderResults = renderResults;


// ✅ Dynamic imports
import('./modules/editElementById.js').then(mod => {
  window.editElementById = mod.editElementById;
});

import('./element-definitions.js').then(mod => {
  window.ukpaElementDefinitions = mod.ukpaElementDefinitions;
});

import('./element-renderer.js').then(mod => {
  window.generateElementHTML = mod.generateElementHTML;
});

// ✅ Global assignments
window.draggingElement = null;
window.isDirty = false;
window.toggleBox = toggleBox;

document.addEventListener('DOMContentLoaded', () => {

  // ✅ Calculator ID
  window.ukpaCalculatorId = new URLSearchParams(window.location.search).get('calc_id');

  // ✅ Register input + UI events
  registerElementEvents();

  // ✅ Save button check
  const saveBtn = document.getElementById('ukpa-save-builder');

  if (saveBtn) {
    saveBtn.addEventListener('click', saveCalculatorLayout);
    injectTestApiButton(saveBtn);
  } else {
    console.log("❌ Save button not found, cannot inject Test API button");
  }

  // ✅ Ctrl+S / Cmd+S shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveCalculatorLayout();
    }
  });

  // ✅ Warn before exit if unsaved
  const exitBtn = document.querySelector(".ukpa-builder-exit");
  if (exitBtn) {
    exitBtn.addEventListener("click", function (e) {
      if (window.isDirty) {
        const confirmed = confirm("⚠️ You have unsaved changes. Are you sure you want to exit?");
        if (!confirmed) e.preventDefault();
      }
    });
  }
});