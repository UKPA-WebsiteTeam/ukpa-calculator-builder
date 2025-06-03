export function createRowContainer(...elements) {
  const rowContainer = document.createElement('div');
  rowContainer.className = 'ukpa-row';

  elements.forEach(el => {
    const column = document.createElement('div');
    column.className = 'ukpa-column';
    column.style.flex = '1';
    column.appendChild(el);
    rowContainer.appendChild(column);
  });

  return rowContainer;
}
