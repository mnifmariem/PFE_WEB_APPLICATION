import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import ChartControls from './ChartControls';

const EnergySavingChart = ({ dataSizes, savingsPercent }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: dataSizes,
    datasets: [
      {
        label: 'Energy Saving (%)',
        data: savingsPercent,
        borderColor: '#2ca02c',
        backgroundColor: 'rgba(44, 160, 44, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Data Size (samples)' } },
      y: { title: { display: true, text: 'Energy Saving (%)' }, min: 0, max: 100 }
    },
    plugins: {
      title: { display: true, text: 'Energy Saving Comparison' },
      legend: { position: 'top' },
      datalabels: { display: false },
    }
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls chartInstance={chartRef.current} />
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default EnergySavingChart;