export function removeEmptyColumnsAndRows(container = document) {
  // 1️⃣ Remove empty columns
  container.querySelectorAll('.ukpa-column').forEach(column => {
    const hasElement = column.querySelector('.ukpa-element');
    if (!hasElement) column.remove();
  });

  // 2️⃣ Remove rows that no longer have any columns
  container.querySelectorAll('.ukpa-row').forEach(row => {
    const hasColumns = row.querySelectorAll('.ukpa-column').length > 0;
    if (!hasColumns) row.remove();
  });
}
