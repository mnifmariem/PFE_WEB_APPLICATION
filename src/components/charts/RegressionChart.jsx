import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  LogarithmicScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartControls from './ChartControls';

ChartJS.register(LogarithmicScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin, annotationPlugin);

const RegressionChart = ({ data, regression1, regression2, r2_1, r2_2, futureSizes, futurePred1, futurePred2 }) => {
  const chartRef = useRef(null);

  if (!Array.isArray(regression1)) regression1 = [];
  if (!Array.isArray(regression2)) regression2 = [];
  if (!data || !Array.isArray(data.dataSizes) || !Array.isArray(data.scenario1) || !Array.isArray(data.scenario2)) {
    return <div>No data for Regression Chart.</div>;
  }

  // Control functions
  const downloadChart = (filename = 'regression_chart.png') => {
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
    datasets: [
      {
        label: 'Scenario 1: Raw Data Transmission',
        data: data.dataSizes.map((x, i) => ({ x, y: data.scenario1[i] })),
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderColor: '#1f77b4',
        backgroundColor: '#1f77b4',
        showLine: false,
      },
      {
        label: 'Scenario 2: Goertzel Intermediate Values',
        data: data.dataSizes.map((x, i) => ({ x, y: data.scenario2[i] })),
        pointStyle: 'square',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderColor: '#ff7f0e',
        backgroundColor: '#ff7f0e',
        showLine: false,
      },
      {
        label: `Scenario 1 Linear Regression (R² = ${r2_1?.toFixed(3) ?? 'N/A'})`,
        data: regression1,
        borderColor: '#1f77b4',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        showLine: true,
      },
      {
        label: `Scenario 2 Linear Regression (R² = ${r2_2?.toFixed(3) ?? 'N/A'})`,
        data: regression2,
        borderColor: '#ff7f0e',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        showLine: true,
      },
      {
        label: 'Scenario 1 Prediction',
        data: futureSizes.map((x, i) => ({ x, y: futurePred1[i] })),
        pointStyle: 'circle',
        pointRadius: 8,
        pointHoverRadius: 10,
        borderColor: '#1f77b4',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        showLine: false,
      },
      {
        label: 'Scenario 2 Prediction',
        data: futureSizes.map((x, i) => ({ x, y: futurePred2[i] })),
        pointStyle: 'square',
        pointRadius: 8,
        pointHoverRadius: 10,
        borderColor: '#ff7f0e',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        showLine: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic',
        title: { display: true, text: 'Data Size (samples)', font: { size: 12 } },
        min: 100,
        max: 100000,
        ticks: {
          callback: function (value) {
            const ticks = [100, 1000, 10000, 100000];
            if (ticks.includes(value)) {
              return value;
            }
            return null;
          },
        },
      },
      y: {
        type: 'logarithmic',
        title: { display: true, text: 'Energy Consumption (mJ)', font: { size: 12 } },
        min: 1,
        max: 10000,
        ticks: {
          callback: function (value) {
            const ticks = [10, 100, 1000, 10000];
            if (ticks.includes(value)) {
              return value;
            }
            return null;
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Linear Regression Analysis of Energy Consumption vs Data Size',
        font: { size: 14, weight: 'bold' },
      },
      legend: { position: 'top', labels: { font: { size: 10 } } },
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
      annotation: {
        annotations: [
          ...futureSizes.map((size, i) => {
            const e1 = futurePred1[i];
            const e2 = futurePred2[i];
            const savings = e1 - e2;
            const percent = (savings / e1) * 100;
            if ([2000, 5000, 10000, 100000, 400000].includes(size)) {
              return {
                type: 'line',
                xMin: size,
                xMax: size,
                yMin: e1 * 0.85,
                yMax: e1 * 1.15,
                borderColor: '#1f77b4',
                borderWidth: 1,
                label: {
                  content: `${size}: ${e1.toFixed(0)} mJ`,
                  position: 'end',
                  yAdjust: -10,
                  xAdjust: -size * 0.05,
                  font: { size: 9, weight: 'bold' },
                  color: '#1f77b4',
                  rotation: 10,
                },
              };
            }
            return null;
          }).filter(a => a),
          ...futureSizes.map((size, i) => {
            const e1 = futurePred1[i];
            const e2 = futurePred2[i];
            const savings = e1 - e2;
            const percent = (savings / e1) * 100;
            if ([2000, 5000, 10000, 100000, 400000].includes(size)) {
              return {
                type: 'line',
                xMin: size,
                xMax: size,
                yMin: e2 * 0.75,
                yMax: e2 * 1.15,
                borderColor: '#ff7f0e',
                borderWidth: 1,
                label: {
                  content: `${size}: ${e2.toFixed(0)} mJ\n↓${savings.toFixed(1)} mJ\n(${percent.toFixed(1)}%)`,
                  position: 'end',
                  yAdjust: 10,
                  xAdjust: -size * 0.05,
                  font: { size: 9, weight: 'bold' },
                  color: '#ff7f0e',
                  rotation: 10,
                },
              };
            }
            return null;
          }).filter(a => a),
        ].filter(a => a),
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls
          onDownload={() => downloadChart('regression_chart.png')}
          onFullScreen={toggleFullScreen}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onAutoscale={autoscale}
          onZoomSelect={zoomSelect}
          onReset={resetZoom}
          chartInstance={chartRef.current}
        />
        <Scatter ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RegressionChart;