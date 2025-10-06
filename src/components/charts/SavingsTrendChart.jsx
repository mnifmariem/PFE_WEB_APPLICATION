import React, { useRef } from 'react';
import {
  Chart as ChartJS, LogarithmicScale, LineElement, PointElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartControls from './ChartControls';

ChartJS.register(LogarithmicScale, LineElement, PointElement, Title, Tooltip, Legend, zoomPlugin);

const SavingsTrendChart = ({ labels, savingsPercent }) => {
  const chartRef = useRef(null);

  const downloadChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'savings_trend_chart.png';
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const chartData = {
    labels,
    datasets: [{
      label: 'Energy Savings (%)',
      data: savingsPercent,
      borderColor: '#2ca02c',
      backgroundColor: 'rgba(44, 160, 44, 0.2)',
      borderWidth: 2,
      fill: true,
      tension: 0.1,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'logarithmic', title: { display: true, text: 'Data Size (samples)' } },
      y: { title: { display: true, text: 'Energy Savings (%)' }, min: 0, max: 100 }
    },
    plugins: {
      title: { display: true, text: 'Energy Savings Trend' },
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
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SavingsTrendChart;