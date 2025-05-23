document.addEventListener("DOMContentLoaded", function () {
	const inputBox = document.getElementById("ab-input-box");
	const contentSection = document.getElementById("ab-content-section");
	const resultContainer = document.getElementById("main-result-container");
	const resultChart = document.getElementById("ab-result-container");

	let hasSwitched = false;

	function evaluateConditions(rules = []) {
		return rules.every(rule => {
			const field = document.getElementById(rule.field);
			if (!field) return false;

			const value = field.type === 'checkbox' ? field.checked : field.value;

			switch (rule.operator) {
				case 'equals': return value == rule.value;
				case 'not_equals': return value != rule.value;
				case 'contains': return String(value).includes(rule.value);
				case 'not_contains': return !String(value).includes(rule.value);
				default: return true;
			}
		});
	}

	function applyAllConditions() {
		document.querySelectorAll('.ukpa-conditional').forEach(el => {
			try {
				const rules = JSON.parse(el.dataset.conditions || '[]');
				const shouldShow = evaluateConditions(rules);
				el.style.display = shouldShow ? '' : 'none';
			} catch (err) {
				console.warn('Invalid condition format on element:', el, err);
			}
		});
	}

function renderResults() {
  // ✅ Update Main Result Values
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    if (!key) return;

    let current = window.ukpaResults;
    key.split('.').forEach(part => {
      current = current?.[isNaN(part) ? part : parseInt(part)];
    });

    el.textContent = (current !== undefined && current !== null) ? current : '--';
  });

  // ✅ Render Breakdown Tables
  document.querySelectorAll('.ab-breakdown-table').forEach(table => {
    const key = table.dataset.resultKey;
    const data = window.ukpaResults?.[key];

    if (Array.isArray(data)) {
      let rows = `<table class="ab-breakdown-inner"><thead>
        <tr><th>Band</th><th>Rate</th><th>Amount</th><th>Tax</th></tr>
      </thead><tbody>`;
      data.forEach(row => {
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
      table.innerHTML = '<em>No breakdown data</em>';
    }
  });

  // ✅ Render Bar Charts
  window.ukpaCharts = window.ukpaCharts || {};

  document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const key = canvas.dataset.resultKey;
    const breakdown = window.ukpaResults?.[key];

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



window.renderResults = renderResults;

function sendToBackend(inputs) {
	if (!ukpa_api_data?.base_url || !ukpa_api_data?.plugin_token) {
		console.warn('⚠️ Missing plugin token or API URL.');
		return;
	}

	const payload = {};
	for (const [elementId, value] of Object.entries(inputs)) {
		const inputEl = document.querySelector(`[name="${elementId}"]`);
		const wrapper = inputEl?.closest('.ukpa-element');
		const config = wrapper ? JSON.parse(wrapper.dataset.config || '{}') : {};
		const paramName = config.name?.trim() || config.label?.trim() || elementId;

		if (paramName) {
			payload[paramName] = value;
		}
	}

	console.log("📤 Sending to backend:", payload);

	const requestUrl = `${ukpa_api_data.base_url}/routes/mainRouter/${ukpa_api_data.backend_route}`;
	console.log("📡 Fetching from:", requestUrl);

	fetch(requestUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Plugin-Auth': ukpa_api_data.plugin_token
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	})
	.then(async res => {
		console.log("📥 Raw Response:", res);
		const data = await res.json();
		console.log("✅ Parsed Response:", data);

		if (res.ok && data.result && typeof data.result === 'object') {
			console.log("🟢 API Success");
			window.ukpaResults = data.result;

			// ✅ Populate Bar Chart data
			if (Array.isArray(data.result.breakdown)) {
				const labels = data.result.breakdown.map(row => row.band || row.label || '');
				const values = data.result.breakdown.map(row => row.tax || row.amount || 0);

				window.ukpaChartData = {
					breakdown: {
						labels: labels,
						datasets: [{
							label: 'Tax Breakdown',
							data: values,
							backgroundColor: '#22c55e'
						}]
					}
				};
			}

			// ✅ Populate Breakdown Table
			document.querySelectorAll('.ab-breakdown-table').forEach(table => {
				const key = table.dataset.resultKey;
				if (key === 'breakdown' && Array.isArray(data.result.breakdown)) {
					const rows = data.result.breakdown.map(row => `
						<div class="ab-breakdown-row">
							<div>${row.band || ''}</div>
							<div>${row.rate || ''}%</div>
							<div>£${row.amount?.toLocaleString() || 0}</div>
							<div>£${row.tax?.toLocaleString() || 0}</div>
						</div>
					`).join('');
					table.innerHTML = `
						<div class="ab-breakdown-head">
							<div>Band</div><div>Rate</div><div>Amount</div><div>Tax</div>
						</div>
						${rows}
					`;
				}
			});

			renderResults();
		} else {
			console.warn("🟡 Error from API:", data.message || data);
		}
	})
	.catch(err => {
		console.error("❌ Fetch error:", err);
	});
}




function bindInputTriggers() {
	const inputs = inputBox?.querySelectorAll("input, select, textarea");
	if (!inputs) return;

	inputs.forEach(input => {
		input.addEventListener("input", () => {
			if (!hasSwitched) {
				if (contentSection) contentSection.style.display = "none";
				if (resultContainer) resultContainer.style.display = "flex";
				if (inputBox) inputBox.style.width = "60%";
				hasSwitched = true;
			}

			applyAllConditions();

			const collected = {};
			inputs.forEach(el => {
				if (el.type === 'checkbox') {
					collected[el.name] = el.checked;
				} else {
					collected[el.name] = el.value;
				}
			});

			sendToBackend(collected);
		});
	});
}


	window.resetForm = function () {
		const form = inputBox?.querySelector('form');
		if (!form) {
			console.warn("Form not found in #ab-input-box");
			return;
		}

		form.querySelectorAll('input, select, textarea').forEach(field => {
			const tag = field.tagName.toLowerCase();
			if (tag === 'select') {
				const fallback = field.getAttribute('data-reset-default');
				field.value = fallback || field.options?.[0]?.value || '';
			} else if (field.type === 'checkbox' || field.type === 'radio') {
				field.checked = false;
			} else {
				field.value = '';
			}
		});

		document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
			const ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		});

		document.querySelectorAll('.ab-main-result-value').forEach(el => el.textContent = '--');
		document.querySelectorAll('.ab-breakdown-table').forEach(el => el.innerHTML = '');

		if (contentSection) contentSection.style.display = "block";
		if (resultContainer) resultContainer.style.display = "none";
		if (inputBox) inputBox.style.width = "35%";

		hasSwitched = false;

		applyAllConditions();
		bindInputTriggers();
		renderResults();
	};

	// 🔁 Initial load
	applyAllConditions();
	bindInputTriggers();
	renderResults();
});
document.addEventListener("DOMContentLoaded", () => {
  // If `window.ukpaResults` is already set by an API response
  if (window.ukpaResults && typeof renderResults === 'function') {
    renderResults();
  }
});