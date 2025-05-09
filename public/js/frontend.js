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

	// 📊 Render Bar Charts and other result items
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

	// 👂 Bind input triggers to activate layout and charts
	function bindInputTriggers() {
		const inputs = inputBox?.querySelectorAll("input, select");
		inputs?.forEach(input => {
			input.addEventListener("input", () => {
				if (!hasSwitched) {
					if (contentSection) contentSection.style.display = "none";
					if (resultContainer) resultContainer.style.display = "flex";
					if (inputBox) inputBox.style.width = "60%";
					hasSwitched = true;
					renderResults(); // render charts on first input
				}
				applyAllConditions();
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

		// Reset input values
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

		// Reset result chart
		document.querySelectorAll('.ab-bar-chart').forEach(canvas => {
			const ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		});

		// Reset main result values
		document.querySelectorAll('.ab-main-result-value').forEach(el => el.textContent = '--');

		// Clear breakdown tables
		document.querySelectorAll('.ab-breakdown-table').forEach(el => el.innerHTML = '');


		// Reset result values
		document.querySelectorAll('.ab-main-result-value').forEach(el => el.textContent = '--');
		document.querySelectorAll('.ab-breakdown-table').forEach(el => el.innerHTML = '');

		// Reset layout display
		if (contentSection) contentSection.style.display = "block";
		if (resultContainer) resultContainer.style.display = "none";
		if (inputBox) inputBox.style.width = "35%";

		// Reset state
		hasSwitched = false;

		// Reapply logic + bind events
		applyAllConditions();
		bindInputTriggers();
		renderResults();
	};

	// 🔁 Initial page setup
	applyAllConditions();
	bindInputTriggers();
	renderResults();
});
