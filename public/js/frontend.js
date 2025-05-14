document.addEventListener("DOMContentLoaded", function () {
	const inputBox = document.getElementById("ab-input-box");
	const contentSection = document.getElementById("ab-content-section");
	const resultContainer = document.getElementById("main-result-container");
	const resultChart = document.getElementById("ab-result-container");

	let hasSwitched = false;

	// ✅ Conditional Logic Evaluator
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

	// 🧠 Apply All Conditions
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

	// 📊 Render Bar Charts
	function renderResults() {
		document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
			const ctx = canvas.getContext('2d');
			const chartData = window.ukpaChartData?.[canvas.dataset.resultKey] || {
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

	// 📡 Send input data to backend
function sendToBackend(inputs) {
    if (!ukpa_api_data?.base_url || !ukpa_api_data?.plugin_token) {
        console.warn('⚠️ Missing plugin token or API URL.');
        return;
    }

    const payload = {
        calcId: window.ukpaCalculatorId || 'unknown',
        inputs: inputs
    };

    console.log("📤 Sending to backend:", payload);

    const requestUrl = `${ukpa_api_data.base_url}/routes/mainRouter/salary`;
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
    .then(res => {
        console.log("📥 Raw response:", res);
        return res.json();
    })
    .then(data => {
        console.log("✅ Parsed response:", data);

        if (data.success) {
            // Replace with actual result rendering logic
            console.log("🟢 Success:", data.result);
        } else {
            console.warn("🟡 Backend returned error:", data.message || data);
        }
    })
    .catch(err => {
        console.error("❌ Fetch error:", err);
    });
}


	// 👂 Bind input triggers
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

				// Collect all input values
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

	// 🔁 Reset Form Logic
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
