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
		el.textContent = window.ukpaResults?.[key] ?? '--';
	});

	// ✅ Render Bar Charts
	document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
		const ctx = canvas.getContext('2d');
		const key = canvas.dataset.resultKey;
		const chartData = window.ukpaChartData?.[key] || {
		labels: ['A', 'B', 'C'],
		datasets: [{
			label: 'Example',
			data: [10, 20, 30],
			backgroundColor: '#22c55e'
		}]
		};

		new Chart(ctx, {
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

	const route = ukpa_api_data.backend_route;
	const requestUrl = `${ukpa_api_data.base_url}/routes/mainRouter/${ukpa_api_data.backend_route}`;
	console.log("📡 Sending fetch to:", requestUrl);

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
    console.log("📥 Raw response:", res);
    const data = await res.json();
    console.log("✅ Parsed response:", data);

    if (res.ok) {
		console.log("🟢 Success:", data);

		// ✅ SET GLOBAL RESULT OBJECT for renderResults to use
		if (data.result && typeof data.result === 'object') {
			window.ukpaResults = data.result;
			renderResults(); // Re-render with latest data
		}

		// ✅ Populate dynamic dropdowns from backend Results
		if (data.Results && Array.isArray(data.Results)) {
			const dropdowns = document.querySelectorAll(`.ukpa-result-dropdown[data-result-key]`);
			dropdowns.forEach(dropdown => {
				dropdown.innerHTML = '';
				data.Results.forEach(option => {
					const opt = document.createElement('option');
					opt.value = option;
					opt.textContent = option;
					dropdown.appendChild(opt);
				});
			});
		}

	} else {
		console.warn("🟡 Backend returned error:", data.message || data);
	}

	})

	.catch(err => {
		console.error("❌ Fetch error:", err);
	});
}


	function bindInputTriggers() {
		const inputs = inputBox?.querySelectorAll("input, select");
		if (!inputs) return;

		inputs.forEach(input => {
			input.addEventListener("input", () => {
				if (!hasSwitched) {
					if (contentSection) contentSection.style.display = "none";
					if (resultContainer) resultContainer.style.display = "flex";
					if (inputBox) inputBox.style.width = "60%";
					hasSwitched = true;
					renderResults();
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
