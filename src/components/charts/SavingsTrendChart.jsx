import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  LogarithmicScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartControls from './ChartControls';

ChartJS.register(LogarithmicScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, zoomPlugin);

const SavingsTrendChart = ({ labels, savingsPercent }) => {
  const chartRef = useRef(null);

  // Control functions
  const downloadChart = (filename = 'savings_trend_chart.png') => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  const toggleFullScreen = () => {
    if (chartRef.current) {
      const element = chartRef.current.canvas.parentElement;
      if (!document.fullscreenElement) {
        element.requestFullscreen().catch((err) => {
          console.error('Error entering full screen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const zoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom(1.1);
    }
  };

  const zoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom(0.9);
    }
  };

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const autoscale = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
      chartRef.current.update('none');
    }
  };

  const zoomSelect = () => {
    if (chartRef.current && chartRef.current.options?.plugins?.zoom) {
      chartRef.current.options.plugins.zoom.zoom.drag.enabled = true;
      chartRef.current.update('none');
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Energy Savings (%)',
        data: savingsPercent,
        borderColor: '#2ca02c',
        backgroundColor: 'rgba(44, 160, 44, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'logarithmic', title: { display: true, text: 'Data Size (samples)' } },
      y: { title: { display: true, text: 'Energy Savings (%)' }, min: 0, max: 100 },
    },
    plugins: {
      title: { display: true, text: 'Energy Savings Trend' },
      legend: { position: 'top' },
      datalabels: { display: false },
      zoom: {
        zoom: {
          wheel: { enabled: false },
          pinch: { enabled: true },
          drag: { enabled: false, backgroundColor: 'rgba(225,225,225,0.3)' },
          mode: 'xy',
        },
        pan: { enabled: true, mode: 'xy' },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls
          onDownload={() => downloadChart('savings_trend_chart.png')}
          onFullScreen={toggleFullScreen}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onAutoscale={autoscale}
          onZoomSelect={zoomSelect}
          onReset={resetZoom}
          chartInstance={chartRef.current}
        />
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SavingsTrendChart;