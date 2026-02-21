import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(annotationPlugin);

const RiskChart = ({ simulationResults, stats }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!simulationResults || simulationResults.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    // Destroy previous chart if exists
    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    // Create histogram bins
    const bins = {};
    simulationResults.forEach((val) => {
      const rounded = Math.round(val);
      bins[rounded] = (bins[rounded] || 0) + 1;
    });

    const labels = Object.keys(bins).map((v) => v.toString());
    const data = Object.values(bins);

    // Create annotations for min, max, mean, median, P90
    const annotations = {};
    if (stats) {
      [
        { key: "min_duration", color: "rgba(75,192,192,0.8)", label: "Min" },
        { key: "max_duration", color: "rgba(153,102,255,0.8)", label: "Max" },
        { key: "mean_duration", color: "rgba(255,99,132,0.8)", label: "Mean" },
        { key: "median_duration", color: "rgba(54,162,235,0.8)", label: "Median" },
        { key: "p90_duration", color: "rgba(255,206,86,0.8)", label: "P90" },
      ].forEach(({ key, color, label }, idx) => {
        if (stats[key] != null) {
          annotations[`line${idx}`] = {
            type: "line",
            xMin: stats[key],
            xMax: stats[key],
            borderColor: color,
            borderWidth: 2,
            label: {
              display: true,       // <--- this is required
              content: label,
              position: "start",
              color: "#000",
              font: { weight: "bold" },
              rotation: 0,
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: 4,
            },
          };
        }
      });
    }

    chartRef.current.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Number of Simulations",
            data,
            backgroundColor: "rgba(31, 119, 180, 0.7)",
            borderColor: "rgba(31, 119, 180, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Project Completion Risk Distribution",
            font: { size: 16 },
          },
          annotation: {
            annotations, // this now works
          },
        },
        scales: {
          x: { title: { display: true, text: "Project Duration (days)" } },
          y: { title: { display: true, text: "Frequency" }, beginAtZero: true },
        },
      },
    });
  }, [simulationResults, stats]);

  return <canvas ref={chartRef}></canvas>;
};

export default RiskChart;
