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
    key.split('.').forEach(part => current = current?.[isNaN(part) ? part : parseInt(part)]);
    el.textContent = (current !== undefined && current !== null) ? formatCurrency(current) : '--';
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
        <thead><tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  });

  // ✅ Render Bar Charts using config.dynamicResult
  window.ukpaCharts = window.ukpaCharts || {};
  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let key = canvas.dataset.resultKey;

    // 🔁 Use dynamicResult from config if present
    const configAttr = canvas.closest('.ukpa-element')?.dataset.config;
    if (configAttr) {
      try {
        const cfg = JSON.parse(configAttr);
        if (cfg.dynamicResult) key = cfg.dynamicResult;
      } catch (e) {
        console.warn('⚠️ Bar chart config parse failed:', e);
      }
    }

    const breakdown = window.ukpaResults?.[key];
    if (!ctx || !Array.isArray(breakdown)) return;

    if (window.ukpaCharts[key]) window.ukpaCharts[key].destroy();

    let labels = [], values = [];

    if ('band' in breakdown[0] && 'tax' in breakdown[0]) {
      // 📊 Breakdown-style object
      labels = breakdown.map((row, i) => {
        const val = Number((row.band || '0').toString().replace(/[£,]/g, ''));
        return i === breakdown.length - 1 && val > 1e9
          ? `Above £${Number(breakdown[i - 1]?.band || 0).toLocaleString()}`
          : `£${val.toLocaleString()}`;
      });
      values = breakdown.map(row => parseFloat((row.tax || '0').toString().replace(/[£,]/g, '')) || 0);
    } else if ('label' in breakdown[0] && 'value' in breakdown[0]) {
      // 📦 OtherResult-style object
      labels = breakdown.map(row => row.label);
      values = breakdown.map(row => parseFloat(row.value) || 0);
    } else {
      // 🧩 Fallback: generic object
      labels = Object.keys(breakdown);
      values = Object.values(breakdown).map(val => parseFloat(val) || 0);
    }



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

  // ✅ Render Other Results using config.dynamicResult
  document.querySelectorAll('.ab-other-result').forEach(wrapper => {
    let key = wrapper.dataset.key;

    // 🔁 Check config for dynamicResult override
    const configAttr = wrapper.closest('.ukpa-element')?.dataset.config;
    if (configAttr) {
      try {
        const cfg = JSON.parse(configAttr);
        key = cfg.dynamicResult || key;
      } catch (e) {
        console.warn('⚠️ Other result config parse failed:', e);
      }
    }

    const data = window.ukpaResults?.[key];
    if (!Array.isArray(data)) {
      wrapper.innerHTML = `<div class="ab-other-label">${wrapper.dataset.label || 'loading results'}</div><div class="ab-other-value">--</div>`;
      return;
    }

    const layout = wrapper.dataset.layout || 'column';
    const wrapSetting = wrapper.dataset.wrap !== 'false';

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

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ab-other-card';
      if (layout === 'row' && item.id && widths[item.id]) {
        card.style.width = widths[item.id];
      }
      card.innerHTML = `
        <div class="ab-other-label">${item.label}</div>
        <div class="ab-other-value">${formatCurrency(item.value)}</div>`;
      container.appendChild(card);
    });

    wrapper.innerHTML = '';
    wrapper.appendChild(container);
  });

  // ✅ Apply config to Secondary Result Wrapper
  const wrapper = document.querySelector('.ab-secondary-result-wrapper');
  if (wrapper && wrapper.dataset.config) {
    try {
      const config = JSON.parse(wrapper.dataset.config);

      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = config.layout === 'column' ? 'column' : 'row';
      wrapper.style.flexWrap = config.layout === 'row' ? 'nowrap' : 'wrap';
      if (config.gap) {
        wrapper.style.gap = typeof config.gap === 'number' ? `${config.gap}px` : config.gap;
      }

      const left = wrapper.querySelector('.ab-chart-results');
      const right = wrapper.querySelector('.ab-other-results');
      if (left && config.columnWidths?.left) left.style.width = config.columnWidths.left;
      if (right && config.columnWidths?.right) right.style.width = config.columnWidths.right;

    } catch (e) {
      console.warn('⚠️ Failed to parse wrapper config:', e);
    }
  }
}
