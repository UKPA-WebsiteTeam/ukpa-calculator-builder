export function renderResults() {
  console.log('🔄 renderResults triggered');
  console.log('🌐 Current window.ukpaResults:', window.ukpaResults);

  // ✅ Update Main Result Values
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    if (!key) return;

    console.log(`📌 Processing Main Result Key: ${key}`);

    let current = window.ukpaResults;
    key.split('.').forEach(part => {
      current = current?.[isNaN(part) ? part : parseInt(part)];
    });

    console.log(`➡️ Resolved value for "${key}":`, current);
    el.textContent = (current !== undefined && current !== null) ? current : '--';
  });

  // ✅ Render Breakdown Tables
  document.querySelectorAll('.ab-breakdown-table').forEach(table => {
    const key = table.dataset.resultKey;
    const data = window.ukpaResults?.[key];

    console.log(`📊 Rendering Breakdown Table for key: ${key}`, data);

    if (Array.isArray(data)) {
      let rows = `<table class="ab-breakdown-inner"><thead>
        <tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr>
      </thead><tbody>`;
      data.forEach(row => {
        console.log('➕ Row data:', row);
        rows += `<tr>
          <td>${row.band ?? ''}</td>
          <td>${row.rate ?? ''}%</td>
          <td>${row.amount ?? ''}</td>
          <td>${row.tax ?? ''}</td>
        </tr>`;
      });
      rows += '</tbody></table>';
      table.innerHTML = rows;
    } else {
      console.warn(`⚠️ No valid array found for breakdown key: ${key}`);
      table.innerHTML = '<em>No breakdown data</em>';
    }
  });

  // ✅ Render Bar Charts
  window.ukpaCharts = window.ukpaCharts || {};

  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const key = canvas.dataset.resultKey || 'breakdown';
        const breakdown = window.ukpaResults?.[key];

        if (!Array.isArray(breakdown)) {
        console.warn("⚠️ Chart skipped due to missing/invalid key:", key);
        return;
        }


    console.log(`📈 Preparing bar chart for key: ${key}`, breakdown);

    if (window.ukpaCharts[key]) {
      window.ukpaCharts[key].destroy();
    }

    const chartData = Array.isArray(breakdown)
      ? {
          labels: breakdown.map(row => row.band ?? 'N/A'),
          datasets: [{
            label: 'Tax',
            data: breakdown.map(row => row.tax ?? 0),
            backgroundColor: '#22c55e'
          }]
        }
      : {
          labels: ['No Data'],
          datasets: [{ label: 'None', data: [0] }]
        };

    console.log('📦 Chart data:', chartData);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
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
