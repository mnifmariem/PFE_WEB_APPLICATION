import React, { useRef } from 'react';
import {
  Chart as ChartJS, LogarithmicScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartControls from './ChartControls';

ChartJS.register(LogarithmicScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const RegressionChart = ({ data, regression1, regression2, r2_1, r2_2 }) => {
  const chartRef = useRef(null);

  if (!Array.isArray(regression1)) regression1 = [];
  if (!Array.isArray(regression2)) regression2 = [];
  if (!data || !Array.isArray(data.dataSizes) || !Array.isArray(data.scenario1) || !Array.isArray(data.scenario2)) {
    return <div>No data for Regression Chart.</div>;
  }

  const downloadChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'regression_chart.png';
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const chartData = {
    datasets: [
      {
        label: 'Scenario 1: Raw Data Transmission',
        data: data.dataSizes.map((x, i) => ({ x, y: data.scenario1[i] })),
        pointStyle: 'circle', pointRadius: 5, borderColor: '#1f77b4', backgroundColor: '#1f77b4', showLine: false,
      },
      {
        label: 'Scenario 2: Goertzel Intermediate Values',
        data: data.dataSizes.map((x, i) => ({ x, y: data.scenario2[i] })),
        pointStyle: 'square', pointRadius: 5, borderColor: '#ff7f0e', backgroundColor: '#ff7f0e', showLine: false,
      },
      {
        label: `Scenario 1 Linear Regression (R² = ${r2_1?.toFixed(3) ?? "N/A"})`,
        data: regression1,
        borderColor: '#1f77b4', borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0, showLine: true,
      },
      {
        label: `Scenario 2 Linear Regression (R² = ${r2_2?.toFixed(3) ?? "N/A"})`,
        data: regression2,
        borderColor: '#ff7f0e', borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0, showLine: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic',
        title: { display: true, text: 'Data Size (samples)' },
        min: 100,
      },
      y: {
        type: 'logarithmic',
        title: { display: true, text: 'Energy Consumption (mJ)' },
        min: 1,
      }
    },
    plugins: {
      title: { display: true, text: 'Linear Regression Analysis of Energy Consumption vs Data Size' },
      legend: { position: 'top' },
      datalabels: { display: false },
      zoom: {
        pan: { enabled: true, mode: 'xy' },
        zoom: { wheel: { enabled: false }, pinch: { enabled: true }, mode: 'xy' }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls onDownload={downloadChart} chartInstance={chartRef.current} />
        <Scatter ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RegressionChart;