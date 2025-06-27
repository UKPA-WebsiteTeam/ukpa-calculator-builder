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
      const renderChart = () => {
        const ctx = canvas.getContext('2d');
        let key = canvas.dataset.resultKey;

        // 🔁 Use dynamicResult from config if present
        const configAttr = canvas.closest('.ukpa-element')?.dataset.config;
        if (configAttr) {
          try {
            const cfg = JSON.parse(configAttr);
            if (cfg.dynamicResult) key = cfg.dynamicResult;
          } catch (e) {
            console.warn('⚠️ Failed to parse bar chart config:', e);
          }
        }

        // 🧠 Safely access breakdown
        let breakdown = window.ukpaResults;
        if (key) {
          key.split('.').forEach(part => {
            breakdown = breakdown?.[isNaN(part) ? part : parseInt(part)];
          });
        }

        if (!ctx || !breakdown || typeof breakdown !== 'object') return;

        // 🧹 Clean up old chart
        if (window.ukpaCharts?.[key]) {
          window.ukpaCharts[key].destroy();
        }

        // 🎯 Determine chart labels and values
        let labels = [], values = [];

        if (Array.isArray(breakdown)) {
          const first = breakdown[0] || {};

          if ('label' in first && 'value' in first) {
            labels = breakdown.map(row => row.label || '—');
            values = breakdown.map(row => parseFloat(row.value) || 0);
          } else if ('band' in first && 'tax' in first) {
            labels = breakdown.map((row, i) => {
              const val = Number((row.band || '0').toString().replace(/[£,]/g, ''));
              return i === breakdown.length - 1 && val > 1e9
                ? `Above £${Number(breakdown[i - 1]?.band || 0).toLocaleString()}`
                : `£${val.toLocaleString()}`;
            });
            values = breakdown.map(row => parseFloat((row.tax || '0').toString().replace(/[£,]/g, '')) || 0);
          }
        } else if (typeof breakdown === 'object') {
          labels = Object.keys(breakdown);
          values = Object.values(breakdown).map(v =>
            typeof v === 'number' ? v : parseFloat(String(v).replace(/[£,]/g, '')) || 0
          );
        }

        // 🖼️ Resize canvas for clarity
        const wrapper = canvas.closest('.ab-chart-wrapper');
        const rawWidth = wrapper?.offsetWidth || 400;
        const rawHeight = wrapper?.offsetHeight || 250;
        const ratio = window.devicePixelRatio || 1;

        canvas.width = rawWidth * ratio;
        canvas.height = rawHeight * ratio;
        canvas.style.width = `${rawWidth}px`;
        canvas.style.height = `${rawHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);

        // 📊 Create chart
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Tax',
              data: values,
              backgroundColor: values.map((_, i) =>
                ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 6]
              )
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `£${ctx.raw.toLocaleString()}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: val => `£${val.toLocaleString()}`
                }
              }
            }
          }
        });

        window.ukpaCharts = window.ukpaCharts || {};
        window.ukpaCharts[key] = chart;
      };

      // 🧠 Run after layout settles
      const observer = new ResizeObserver(() => renderChart());
      observer.observe(canvas.closest('.ab-chart-wrapper'));

      // ⏳ Fallback if ResizeObserver fails
      requestAnimationFrame(() => renderChart());
  });

  // ✅ Render Other Result Cards
document.querySelectorAll('.ab-other-result').forEach(wrapper => {
  let key = wrapper.dataset.key;

  // 🔍 Fallback to dynamicResult if config exists
  if (!key && wrapper.closest('.ukpa-element')?.dataset.config) {
    try {
      const cfg = JSON.parse(wrapper.closest('.ukpa-element').dataset.config);
      key = cfg.dynamicResult || '';
    } catch (e) {
      console.warn('❌ Config parse failed for Other Result:', e);
    }
  }

  if (!key) {
    wrapper.innerHTML = '<div class="ab-other-label">No result key</div><div class="ab-other-value">--</div>';
    return;
  }

  const layout = wrapper.dataset.layout || 'column';
  const wrapSetting = wrapper.dataset.wrap !== 'false'; // default true
  const data = window.ukpaResults?.[key];

  if (!Array.isArray(data)) {
    wrapper.innerHTML = `<div class="ab-other-label">${wrapper.dataset.label || 'loading results'}</div><div class="ab-other-value">--</div>`;
    return;
  }

  const widths = (() => {
    try {
      return JSON.parse(wrapper.dataset.widths || '{}');
    } catch {
      return {};
    }
  })();

  const container = document.createElement('div');
  container.className = `ab-other-wrapper ab-other-${layout} ${wrapSetting ? 'wrap-enabled' : 'no-wrap'}`;
  container.style.flexWrap = wrapSetting ? 'wrap' : 'nowrap';

  const formatCurrency = val =>
    typeof val === 'number'
      ? `£${val.toLocaleString()}`
      : (typeof val === 'string' && val.startsWith('£'))
        ? val
        : `£${Number(val).toLocaleString()}`;

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'ab-other-card';

    if (layout === 'row' && item.id && widths[item.id]) {
      card.style.width = widths[item.id];
    }

    card.innerHTML = `
      <div class="ab-other-label">${item.label}</div>
      <div class="ab-other-value">${formatCurrency(item.value)}</div>
    `;
    container.appendChild(card);
  });

  wrapper.innerHTML = '';
  wrapper.appendChild(container);
});

// ✅ Collect dynamic results for lead form submission
const collectedResults = {};

// 1. Main Result
document.querySelectorAll('.ab-main-result-value').forEach(el => {
  const label = el.closest('.ukpa-element')?.querySelector('.ukpa-label')?.textContent?.trim() || 'Main Result';
  const key = el.dataset.key;
  let value = window.ukpaResults;

  key?.split('.').forEach(part => {
    value = value?.[isNaN(part) ? part : parseInt(part)];
  });

  collectedResults[label] = value ?? '--';
});

// 2. Other Result Cards
document.querySelectorAll('.ab-other-result').forEach(wrapper => {
  const label = wrapper.dataset.label?.trim() || 'Other Result';
  let key = wrapper.dataset.key;

  if (!key && wrapper.closest('.ukpa-element')?.dataset.config) {
    try {
      const cfg = JSON.parse(wrapper.closest('.ukpa-element').dataset.config);
      key = cfg.dynamicResult || '';
    } catch {}
  }

  if (key) {
    let value = window.ukpaResults;
    key.split('.').forEach(part => {
      value = value?.[isNaN(part) ? part : parseInt(part)];
    });
    collectedResults[label] = value ?? '--';
  }
});

// 3. Bar Charts
document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
  const label = canvas.dataset.label?.trim() || 'Bar Chart';
  let key = canvas.dataset.resultKey;

  if (!key && canvas.closest('.ukpa-element')?.dataset.config) {
    try {
      const cfg = JSON.parse(canvas.closest('.ukpa-element')?.dataset.config);
      key = cfg.dynamicResult || '';
    } catch {}
  }

  if (key) {
    let value = window.ukpaResults;
    key.split('.').forEach(part => {
      value = value?.[isNaN(part) ? part : parseInt(part)];
    });
    collectedResults[label] = value ?? '--';
  }
});

// ✅ Store to window for lead form submission
window.ukpa_api_data = window.ukpa_api_data || {};
window.ukpa_api_data.result = collectedResults;

}
