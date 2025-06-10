export function renderResultsFrontend() {
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

    // ✅ Support dot notation like "tables.incomeTax"
    let breakdown = window.ukpaResults;
    key.split('.').forEach(part => {
      breakdown = breakdown?.[part];
    });

    console.log('📊 Breakdown for chart:', key, breakdown);

    if (!breakdown || typeof breakdown !== 'object') return;

    if (window.ukpaCharts[key]) {
      window.ukpaCharts[key].destroy();
    }

    let labels = [];
    let values = [];

    if (Array.isArray(breakdown)) {
      // ✅ Case 1: [{ band, tax }]
      if ('band' in breakdown[0] && 'tax' in breakdown[0]) {
        labels = breakdown.map((row, i) => {
          const bandRaw = row.band?.toString() || '';
          const numericBand = Number(bandRaw.replace(/[£,]/g, ''));
          if (i === breakdown.length - 1 && numericBand > 1e9) {
            const prev = breakdown[i - 1]?.band?.toString().replace(/[£,]/g, '') || '0';
            return `Above £${Number(prev).toLocaleString()}`;
          }
          return `£${numericBand.toLocaleString()}`;
        });

        values = breakdown.map(row => {
          const taxStr = row.tax || '0';
          return parseFloat(taxStr.toString().replace(/[£,]/g, '')) || 0;
        });
      }

      // ✅ Case 2: [{ label, value }]
      else if ('label' in breakdown[0] && 'value' in breakdown[0]) {
        labels = breakdown.map(row => row.label);
        values = breakdown.map(row => parseFloat(row.value) || 0);
      }
    }

    // ✅ Case 3: { key: value }
    else {
      labels = Object.keys(breakdown).map(key =>
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      );
      values = Object.values(breakdown).map(val => parseFloat(val) || 0);
    }

    // ✅ Unique bar colors
    const barColors = [
      '#3B82F6', '#EF4444', '#10B981',
      '#F59E0B', '#8B5CF6', '#EC4899',
      '#6366F1', '#22D3EE', '#F43F5E'
    ];
    const colors = values.map((_, i) => barColors[i % barColors.length]);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tax',
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `£${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '£' + value.toLocaleString()
            }
          }
        }
      }
    });

    window.ukpaCharts[key] = chart;
  });



  // ✅ Render Other Result Cards
  document.querySelectorAll('.ab-other-result').forEach(wrapper => {
    const key = wrapper.dataset.key;
    const layout = wrapper.dataset.layout || 'column';
    const wrap = wrapper.dataset.wrap || 'wrap';
    const data = window.ukpaResults?.[key];

    if (!Array.isArray(data)) {
      wrapper.innerHTML = `<div class="ab-other-label">${wrapper.dataset.label || 'loading results'}</div><div class="ab-other-value">--</div>`;
      return;
    }

    const container = document.createElement('div');
    const wrapSetting = wrapper.dataset.wrap === 'true';
    container.className = `ab-other-wrapper ab-other-${layout} ${wrapSetting ? 'wrap-enabled' : 'no-wrap'}`;

    container.style.flexWrap = wrap === 'no-wrap' ? 'nowrap' : 'wrap';

    const widths = (() => {
      try {
        return JSON.parse(wrapper.dataset.widths || '{}');
      } catch {
        return {};
      }
    })();

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ab-other-card';

      if (layout === 'row' && item.id && widths[item.id]) {
        card.style.width = widths[item.id];
      }

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
