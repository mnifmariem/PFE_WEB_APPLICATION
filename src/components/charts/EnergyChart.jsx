// src/components/charts/EnergyChart.jsx
import React, { useRef } from 'react';
import zoomPlugin from 'chartjs-plugin-zoom'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, getElementsAtEvent, getDatasetAtEvent } from 'react-chartjs-2';
import ChartControls from './ChartControls';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);
  
const EnergyChart = ({ data }) => {
  const chartRef = useRef(null);

  // Fonctions de contrôle directes
  const downloadChart = (filename = 'energy_chart.png') => {
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
        element.requestFullscreen().catch(err => {
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
    labels: data.dataSizes,
    datasets: [
      {
        label: 'Scenario 1 (Raw Data)',
        data: data.scenario1,
        backgroundColor: '#6baed6',
        borderColor: '#6baed6',
        borderWidth: 1
      },
      {
        label: 'Scenario 2 (Goertzel)',
        data: data.scenario2,
        backgroundColor: '#ff7f0e',
        borderColor: '#ff7f0e',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Data Size (samples)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Energy Consumption (mJ)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Energy Consumption Comparison'
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: true
          },
          drag: {
            enabled: false,
            backgroundColor: 'rgba(225,225,225,0.3)'
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        }
      },
      datalabels: { display: false},
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.raw.toFixed(6) + ' mJ';
            const idx = context.dataIndex;
            const reduction = 100 * (data.scenario1[idx] - data.scenario2[idx]) / data.scenario1[idx];
            if (!isNaN(reduction)) {
              label += ` (Reduction: ${reduction.toFixed(1)}%)`;
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls
          onDownload={() => downloadChart('energy_chart.png')}
          onFullScreen={toggleFullScreen}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onAutoscale={autoscale}
          onZoomSelect={zoomSelect}
          onReset={resetZoom}
          chartInstance={chartRef.current}
        />
        <Bar 
          ref={chartRef}
          data={chartData} 
          options={options}
        />
      </div>
    </div>
  );
};

export default EnergyChart;