// src/components/charts/RegressionChart.jsx
import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import ChartControls from './ChartControls';

ChartJS.register(LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

const RegressionChart = ({ data, onDownload, onFullScreen }) => {
  const chartRef = useRef();

  // Linear regression function
  const linearRegression = (X, y) => {
    const n = X.length;
    const meanX = X.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (X[i] - meanX) * (y[i] - meanY);
      denominator += (X[i] - meanX) ** 2;
    }
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    return { slope, intercept };
  };

  // R² calculation
  const r2Score = (yTrue, yPred) => {
    const meanY = yTrue.reduce((a, b) => a + b) / yTrue.length;
    const ssTot = yTrue.reduce((a, b) => a + (b - meanY) ** 2, 0);
    const ssRes = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0);
    return 1 - (ssRes / ssTot);
  };

  if (!data) return null;

  const dataSizes = data.data.map(item => item.dataSize);
  const scenario1Energy = data.data.map(item => item.scenario1Energy);
  const scenario2Energy = data.data.map(item => item.scenario2Energy);

  // Fit models
  const model1 = linearRegression(dataSizes, scenario1Energy);
  const model2 = linearRegression(dataSizes, scenario2Energy);

  // Predictions
  const pred1 = dataSizes.map(x => model1.slope * x + model1.intercept);
  const pred2 = dataSizes.map(x => model2.slope * x + model2.intercept);

  const r2_1 = r2Score(scenario1Energy, pred1);
  const r2_2 = r2Score(scenario2Energy, pred2);

  // Extended range for regression lines
  const extendedSizes = Array.from({length: 100}, (_, i) => 100 + (10000 - 100) * i / 99);
  const extendedPred1 = extendedSizes.map(x => model1.slope * x + model1.intercept);
  const extendedPred2 = extendedSizes.map(x => model2.slope * x + model2.intercept);

  const chartData = {
    datasets: [
      {
        label: 'Scenario 1: Raw Data',
        data: dataSizes.map((x, i) => ({ x, y: scenario1Energy[i] })),
        backgroundColor: '#1f77b4',
        borderColor: '#1f77b4',
        showLine: false,
        pointRadius: 6,
      },
      {
        label: 'Scenario 2: Goertzel',
        data: dataSizes.map((x, i) => ({ x, y: scenario2Energy[i] })),
        backgroundColor: '#ff7f0e',
        borderColor: '#ff7f0e',
        showLine: false,
        pointRadius: 6,
        pointStyle: 'rect',
      },
      {
        label: `Scenario 1 Regression (R² = ${r2_1.toFixed(3)})`,
        data: extendedSizes.map((x, i) => ({ x, y: extendedPred1[i] })),
        borderColor: '#1f77b4',
        borderWidth: 2,
        borderDash: [5, 5],
        showLine: true,
        pointRadius: 0,
      },
      {
        label: `Scenario 2 Regression (R² = ${r2_2.toFixed(3)})`,
        data: extendedSizes.map((x, i) => ({ x, y: extendedPred2[i] })),
        borderColor: '#ff7f0e',
        borderWidth: 2,
        borderDash: [5, 5],
        showLine: true,
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic',
        title: {
          display: true,
          text: 'Data Size (samples)'
        }
      },
      y: {
        type: 'logarithmic',
        title: {
          display: true,
          text: 'Energy Consumption (mJ)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Linear Regression Analysis of Energy Consumption vs Data Size'
      },
      legend: {
        position: 'top'
      }
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'regression_chart.png';
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <ChartControls
          onDownload={handleDownload}
          onFullScreen={onFullScreen}
          chartType="regression"
        />
        <Scatter ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RegressionChart;