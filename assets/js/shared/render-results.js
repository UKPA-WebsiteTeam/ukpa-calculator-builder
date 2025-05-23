function renderResults() {
  // ✅ Render Main Results
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    if (!key) return;

    let current = window.ukpaResults;
    key.split('.').forEach(part => {
      current = current?.[isNaN(part) ? part : parseInt(part)];
    });

    el.textContent = (current !== undefined && current !== null) ? current : '--';
  });

  window.ukpaCharts = window.ukpaCharts || {};

  // ✅ Render Bar Charts
  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const key = canvas.dataset.resultKey;

    if (!ctx || !window.ukpaResults?.[key]) return;

    if (window.ukpaCharts[key]) {
      window.ukpaCharts[key].destroy();
    }

    const breakdown = window.ukpaResults[key];

    const labels = breakdown.map(item => item.band || `${item.rate}%`);
    const data = breakdown.map(item => item.tax || 0);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tax by Band',
          data,
          backgroundColor: '#22c55e'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    window.ukpaCharts[key] = chart;
  });

  // ✅ Render Breakdown Tables
  document.querySelectorAll('.ab-breakdown-table').forEach(el => {
    const key = el.dataset.resultKey;
    const data = key && window.ukpaResults ? window.ukpaResults[key] : null;

    if (!Array.isArray(data)) return;

    el.innerHTML = `
      <table>
        <thead>
          <tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.band || ''}</td>
              <td>${row.rate ?? ''}%</td>
              <td>${row.amount?.toLocaleString?.() || ''}</td>
              <td>${row.tax?.toLocaleString?.() || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  });
}
