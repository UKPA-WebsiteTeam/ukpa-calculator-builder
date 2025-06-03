import { markAsDirty } from './markAsDirty.js';
import { saveLayout } from './saveLayout.js';

export function handleDrop(dragged, target, direction) {
  const isFromToolbox = dragged.dataset.source === 'toolbox';
  const type = dragged.dataset.type;

  // 🧪 Diagnostic logging
  console.log("📦 Drop Info:", {
    dragged,
    source: dragged.dataset.source,
    type: dragged.dataset.type,
    id: dragged.dataset.id,
    direction,
    target
  });

  if (!type) {
    console.error("❌ Dropped element is missing data-type. Aborting drop.");
    return;
  }

  let newColumn;

  if (isFromToolbox) {
    // ✅ Generate new ID and config
    const newId = `wise-${type}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`;
    const config = structuredClone(window.ukpaElementDefinitions?.[type]?.default || {});
    const html = window.generateElementHTML(type, newId, config);

    // ✅ Build element HTML
    const el = document.createElement('div');
    el.classList.add('ukpa-element');
    el.setAttribute('draggable', 'true');
    el.setAttribute('data-type', type);
    el.setAttribute('data-id', newId);
    el.setAttribute('data-config', JSON.stringify(config));
    el.innerHTML = `<div class="ukpa-admin-id-label">🆔 <strong>${newId}</strong></div>` + html;

    // ✅ Add editor + drag events
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      window.editElementById?.(newId);
    });

    el.addEventListener("dragstart", () => {
      el.classList.add("dragging");
      window.draggingElement = el;
      console.log(`🟢 Drag start <${type}> (from toolbox)`);
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      window.draggingElement = null;
      console.log(`🛑 Drag end <${type}>`);
    });

    newColumn = wrapInColumn(el);
  } else {
    // ✅ Reuse existing element being moved
    newColumn = dragged.closest('.ukpa-column');
    if (!newColumn) {
      console.warn("⚠️ Could not find a .ukpa-column for dragged element.");
      return;
    }
  }

  const column = target.closest('.ukpa-column');
  const row = column?.closest('.ukpa-row');

  // ✅ Case 1: Drop into empty section
  if (!column && target.classList.contains('ukpa-drop-zone')) {
    const newRow = document.createElement('div');
    newRow.classList.add('ukpa-row');
    newRow.appendChild(newColumn);
    target.appendChild(newRow);

    markAsDirty();
    saveLayout();
    console.log(`✅ ${isFromToolbox ? 'Created' : 'Moved'} <${type}> into empty section`);
    return;
  }

  // ✅ Case 2: Drop beside another element
  if (!row || !column) {
    console.warn("⚠️ Invalid drop target (no row/column). Drop aborted.");
    return;
  }

  switch (direction) {
    case 'top':
    case 'left':
      row.insertBefore(newColumn, column);
      break;
    case 'bottom':
    case 'right':
      if (column.nextSibling) {
        row.insertBefore(newColumn, column.nextSibling);
      } else {
        row.appendChild(newColumn);
      }
      break;
  }

  markAsDirty();
  saveLayout();
  console.log(`✅ ${isFromToolbox ? 'Created and dropped' : 'Moved'} <${type}> ${direction} of <${target.dataset.id}>`);
}

// ✅ Helper to wrap in .ukpa-column
function wrapInColumn(el) {
  const col = document.createElement('div');
  col.classList.add('ukpa-column');
  col.appendChild(el);
  return col;
}
