export function renderResults() {
  console.log('🔄 renderResults triggered');
  console.log('🌐 Current window.ukpaResults:', window.ukpaResults);

  // ✅ Render Main Result
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    if (!key) return;

    let current = window.ukpaResults;
    key.split('.').forEach(part => {
      current = current?.[isNaN(part) ? part : parseInt(part)];
    });

    el.textContent = (current !== undefined && current !== null)
      ? (typeof current === 'number' ? `£${current.toLocaleString()}` : current)
      : '--';
  });

  // ✅ Render Breakdown Table
  document.querySelectorAll('.ab-breakdown-table').forEach(table => {
    const key = table.dataset.resultKey;
    const data = window.ukpaResults?.[key];

    if (Array.isArray(data)) {
      let rows = `<table class="ab-breakdown-inner"><thead>
        <tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr>
      </thead><tbody>`;

      data.forEach((row, i) => {
        let bandLabel = row.band ?? '';
        const numericBand = Number(bandLabel.toString().replace(/[£,]/g, ''));

        if (i === data.length - 1 && numericBand > 1e9) {
          const prevBand = Number(data[i - 1]?.band?.toString().replace(/[£,]/g, '') || 0);
          bandLabel = `Above £${prevBand.toLocaleString()}`;
        } else {
          bandLabel = `£${numericBand.toLocaleString()}`;
        }

        rows += `<tr>
          <td>${bandLabel}</td>
          <td>${row.rate || ''}</td>
          <td>${row.amount || ''}</td>
          <td>${row.tax || ''}</td>
        </tr>`;
      });

      rows += '</tbody></table>';
      table.innerHTML = rows;
    } else {
      table.innerHTML = '<em>No breakdown data</em>';
    }
  });

  // ✅ Render Bar Charts
  window.ukpaCharts = window.ukpaCharts || {};

  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const key = canvas.dataset.resultKey || 'breakdown';
    const breakdown = window.ukpaResults?.[key];

    if (!Array.isArray(breakdown)) return;

    if (window.ukpaCharts[key]) {
      window.ukpaCharts[key].destroy();
    }

    const labels = breakdown.map((row, i) => {
      const bandRaw = row.band?.toString() || '';
      const numericBand = Number(bandRaw.replace(/[£,]/g, ''));
      if (i === breakdown.length - 1 && numericBand > 1e9) {
        const prev = breakdown[i - 1]?.band?.toString().replace(/[£,]/g, '') || '0';
        return `Above £${Number(prev).toLocaleString()}`;
      }
      return `£${numericBand.toLocaleString()}`;
    });

    const chartData = {
      labels,
      datasets: [{
        label: 'Tax',
        data: breakdown.map(row => {
          const taxStr = row.tax || '0';
          return parseFloat(taxStr.replace(/[£,]/g, '')) || 0;
        }),
        backgroundColor: '#22c55e'
      }]
    };

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

  // ✅ Render Other Result Cards
  document.querySelectorAll('.ab-other-result').forEach(wrapper => {
    const key = wrapper.dataset.key;
    const layout = wrapper.dataset.layout || 'column';
    const data = window.ukpaResults?.[key];

    if (!Array.isArray(data)) {
      wrapper.innerHTML = `<div class="ab-other-label">${wrapper.dataset.label || 'Other Result'}</div><div class="ab-other-value">--</div>`;
      return;
    }

    const container = document.createElement('div');
    container.className = `ab-other-wrapper ab-other-${layout}`;

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ab-other-card';
      card.innerHTML = `
        <div class="ab-other-label">${item.label}</div>
        <div class="ab-other-value">${item.value}</div>
      `;
      container.appendChild(card);
    });

    wrapper.innerHTML = '';
    wrapper.appendChild(container);
  });

}
