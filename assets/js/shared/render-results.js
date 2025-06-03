export function renderResults() {
  console.log('🔄 renderResults triggered');
  console.log('🌐 Current window.ukpaResults:', window.ukpaResults);

  const formatCurrency = val =>
    typeof val === 'number'
      ? `£${val.toLocaleString()}`
      : (typeof val === 'string' && val.startsWith('£'))
        ? val
        : `£${Number(val).toLocaleString()}`;

  // ✅ Render Main Results
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    if (!key) return;

    let current = window.ukpaResults;
    key.split('.').forEach(part => {
      current = current?.[isNaN(part) ? part : parseInt(part)];
    });

    el.textContent = (current !== undefined && current !== null)
      ? formatCurrency(current)
      : '--';
  });

  // ✅ Render Breakdown Tables
  document.querySelectorAll('.ab-breakdown-table').forEach(el => {
    const key = el.dataset.resultKey;
    const data = key && window.ukpaResults ? window.ukpaResults[key] : null;

    if (!Array.isArray(data)) return;

    const rows = data.map((row, i) => {
      let bandRaw = row.band ?? '';
      let bandStr = String(bandRaw);
      const isFinal = i === data.length - 1;
      const prev = data[i - 1];

      if (isFinal && /^\d+$/.test(bandStr) && Number(bandStr) > 1e9) {
        bandStr = `Above £${Number(prev?.band).toLocaleString()}`;
      }

      return `
        <tr>
          <td>${bandStr}</td>
          <td>${row.rate ?? ''}</td>
          <td>${formatCurrency(row.amount)}</td>
          <td>${formatCurrency(row.tax)}</td>
        </tr>`;
    }).join('');

    el.innerHTML = `
      <table class="ab-breakdown-inner">
        <thead>
          <tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  });

  // ✅ Render Bar Charts
  window.ukpaCharts = window.ukpaCharts || {};

  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const key = canvas.dataset.resultKey;
    const breakdown = window.ukpaResults?.[key];

    if (!ctx || !Array.isArray(breakdown)) return;

    if (window.ukpaCharts[key]) {
      window.ukpaCharts[key].destroy();
    }

    const labels = breakdown.map((row, i) => {
      const raw = row.band;
      const bandStr = String(raw);
      const prevBand = breakdown[i - 1]?.band;

      if (i === breakdown.length - 1 && /^\d+$/.test(bandStr) && Number(bandStr) > 1e9) {
        return `Above £${Number(prevBand).toLocaleString()}`;
      }

      return bandStr;
    });

    const values = breakdown.map(row => {
      const raw = row.tax || 0;
      return typeof raw === 'number'
        ? raw
        : parseFloat(String(raw).replace(/[£,]/g, '')) || 0;
    });

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tax',
          data: values,
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
}
