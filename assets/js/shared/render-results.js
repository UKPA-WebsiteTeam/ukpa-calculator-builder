export function renderResults() {
  // Main Result display
  document.querySelectorAll('.ab-main-result-value').forEach(el => {
    const key = el.dataset.key;
    el.textContent = window.ukpaResults?.[key] ?? '--';
  });

  // Bar Chart rendering
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
