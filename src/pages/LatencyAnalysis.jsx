import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import Header from '../components/common/Header';
import { useChartControls } from '../hooks/useChartControls';
import ChartControls from '../components/charts/ChartControls';
import DataTable from '../components/tables/DataTable';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(annotationPlugin, zoomPlugin);

const LatencyAnalysis = () => {
  const [selectedDataSizes, setSelectedDataSizes] = useState([]);
  const [latencyTableData, setLatencyTableData] = useState([]);
 
  const latencyChartRef = useRef(null);
  const transmissionChartRef = useRef(null);
  const latencyChartInstance = useRef(null);
  const transmissionChartInstance = useRef(null);
  const latencyTableRef = useRef(null);

  const latencyChartControls = useChartControls(latencyChartInstance, latencyChartRef);
  const transmissionChartControls = useChartControls(transmissionChartInstance, transmissionChartRef);

  const dataSizes = [100, 250, 480, 600, 1000];
  const latencyS1 = [277.8, 606.4, 1126, 1435, 2369];
  const latencyS2 = [184.21, 363.51, 659.11, 808.71, 1360.21];
  const transScenario1 = [277.8, 606.4, 1126, 1435, 2369];
  const transScenario2 = [74.21, 74.21, 74.21, 74.21, 74.21];
  const procScenario2 = [110, 289.3, 584.9, 734.5, 1286];
  const procTimePerSample = procScenario2.map((t, i) => t / dataSizes[i]);
  const procTimePerSamplePerFreq = procTimePerSample.map(t => t / 6);
  const reductionPercent = dataSizes.map((_, i) => 
    100 * (latencyS1[i] - latencyS2[i]) / latencyS1[i]
  );

  const handleTableFullScreen = () => {
    if (!document.fullscreenElement) {
      latencyTableRef.current
        .requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen for latency table:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }
  };

  useEffect(() => {
    initializeLatencyChart();
    initializeTransmissionChart();
    updateLatencyTable(dataSizes, latencyS1, latencyS2, reductionPercent);

    return () => {
      if (latencyChartInstance.current) {
        latencyChartInstance.current.destroy();
      }
      if (transmissionChartInstance.current) {
        transmissionChartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedDataSizes.length > 0) {
      updateChartsWithSelection();
    } else {
      updateLatencyChart(dataSizes, latencyS1, latencyS2);
      updateTransmissionChart(dataSizes, transScenario1, transScenario2, procScenario2, procTimePerSample, procTimePerSamplePerFreq);
      updateLatencyTable(dataSizes, latencyS1, latencyS2, reductionPercent);
    }
  }, [selectedDataSizes]);

  const initializeLatencyChart = () => {
    if (latencyChartInstance.current) {
      latencyChartInstance.current.destroy();
    }

    latencyChartInstance.current = new Chart(latencyChartRef.current, {
      type: 'line',
      data: {
        labels: dataSizes,
        datasets: [
          {
            label: 'Scenario 1: Raw Data',
            data: latencyS1,
            borderColor: '#1f77b4',
            backgroundColor: '#1f77b4',
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Scenario 2: Goertzel',
            data: latencyS2,
            borderColor: '#ff7f0e',
            backgroundColor: '#ff7f0e',
            pointStyle: 'square',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Data Size (samples)',
              font: { size: 12 }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Latency (milliseconds)',
              font: { size: 12 }
            },
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Latency Comparison: Scenarios'
          },
          zoom: {
            zoom: {
              wheel: { enabled: false },
              pinch: { enabled: true },
              drag: { enabled: false, backgroundColor: 'rgba(225,225,225,0.3)' },
              mode: 'xy',
            },
            pan: { enabled: true, mode: 'xy' }
          },
          legend: {
            position: 'top',
            labels: { font: { size: 10 } }
          },
          annotation: false,
          datalabels: { display: false }
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        }
      }
    });
  };

  const initializeTransmissionChart = () => {
    if (transmissionChartInstance.current) {
      transmissionChartInstance.current.destroy();
    }

    transmissionChartInstance.current = new Chart(transmissionChartRef.current, {
      type: 'bar',
      data: {
        labels: dataSizes,
        datasets: [
          {
            label: 'Scenario 1 - Transmission+Reception',
            data: transScenario1,
            backgroundColor: 'skyblue',
            borderColor: 'skyblue',
            borderWidth: 1,
            type: 'bar',
            order: 2,
            barPercentage: 0.8,
            categoryPercentage: 0.9
          },
          {
            label: 'Scenario 2 - Transmission+Reception',
            data: transScenario2,
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 1,
            type: 'bar',
            order: 2,
            stack: 'Scenario2',
            barPercentage: 0.8,
            categoryPercentage: 0.9
          },
          {
            label: 'Scenario 2 - Processing Time',
            data: procScenario2,
            backgroundColor: 'mediumseagreen',
            borderColor: 'mediumseagreen',
            borderWidth: 1,
            type: 'bar',
            order: 2,
            stack: 'Scenario2',
            barPercentage: 0.8,
            categoryPercentage: 0.9
          },
          {
            label: 'Processing Time per Sample (ms/sample/6frequencies)',
            data: procTimePerSample,
            borderColor: 'purple',
            backgroundColor: 'purple',
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: false,
            type: 'line',
            order: 1,
            yAxisID: 'y1'
          },
          {
            label: 'Processing Time per Sample per Frequency (ms/sample/frequency)',
            data: procTimePerSamplePerFreq,
            borderColor: '#ff00ff',
            backgroundColor: '#ff00ff',
            pointStyle: 'triangle',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: false,
            type: 'line',
            order: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Data Size (samples)',
              font: { size: 12 }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Processing Time (ms)',
              font: { size: 12 }
            },
            beginAtZero: true,
            position: 'left'
          },
          y1: {
            title: {
              display: true,
              text: 'Processing Time per Sample (ms/sample)',
              font: { size: 12 }
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: 'purple',
              callback: function(value) {
                const tickValues = [0.100, 0.125, 0.150, 0.175, 0.200, 0.225, 0.250, 0.275, 1.100, 1.125, 1.150, 1.175, 1.200, 1.225, 1.250, 1.275];
                return tickValues.includes(value) ? value.toFixed(3) : '';
              },
              min: 0.100,
              max: 1.275,
              stepSize: 0.025
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Transmission, Reception, and Processing Time Comparison'
          },
          zoom: {
            zoom: {
              wheel: { enabled: false },
              pinch: { enabled: true },
              drag: { enabled: false, backgroundColor: 'rgba(225,225,225,0.3)' },
              mode: 'xy',
            },
            pan: { enabled: true, mode: 'xy' }
          },
          legend: {
            position: 'top',
            labels: { font: { size: 10 } }
          },
          datalabels: { display: false }
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        }
      }
    });
  };

  const updateLatencyChart = (labels, s1Data, s2Data) => {
    if (latencyChartInstance.current) {
      latencyChartInstance.current.data.labels = labels;
      latencyChartInstance.current.data.datasets[0].data = s1Data;
      latencyChartInstance.current.data.datasets[1].data = s2Data;
      latencyChartInstance.current.update();
    }
  };

  const updateTransmissionChart = (labels, trans1, trans2, proc2, procPerSample, procPerFreq) => {
    if (transmissionChartInstance.current) {
      transmissionChartInstance.current.data.labels = labels;
      transmissionChartInstance.current.data.datasets[0].data = trans1;
      transmissionChartInstance.current.data.datasets[1].data = trans2;
      transmissionChartInstance.current.data.datasets[2].data = proc2;
      transmissionChartInstance.current.data.datasets[3].data = procPerSample;
      transmissionChartInstance.current.data.datasets[4].data = procPerFreq;
      transmissionChartInstance.current.update();
    }
  };

  const updateLatencyTable = (labels, s1Data, s2Data, reductionData) => {
    const tableData = labels.map((size, i) => ({
      dataSize: size,
      scenario1: s1Data[i].toFixed(1),
      scenario2: s2Data[i].toFixed(1),
      reduction: reductionData[i].toFixed(1)
    }));
    setLatencyTableData(tableData);
  };

  const updateChartsWithSelection = () => {
    const filteredLabels = dataSizes.filter(size => selectedDataSizes.includes(size));
    const filteredLatencyS1 = filteredLabels.map(size => latencyS1[dataSizes.indexOf(size)]);
    const filteredLatencyS2 = filteredLabels.map(size => latencyS2[dataSizes.indexOf(size)]);
    const filteredReductionPercent = filteredLabels.map((_, i) => 
      100 * (latencyS1[dataSizes.indexOf(filteredLabels[i])] - latencyS2[dataSizes.indexOf(filteredLabels[i])]) / latencyS1[dataSizes.indexOf(filteredLabels[i])]
    );
    const filteredTransScenario1 = filteredLabels.map(size => transScenario1[dataSizes.indexOf(size)]);
    const filteredTransScenario2 = filteredLabels.map(size => transScenario2[dataSizes.indexOf(size)]);
    const filteredProcScenario2 = filteredLabels.map(size => procScenario2[dataSizes.indexOf(size)]);
    const filteredProcTimePerSample = filteredProcScenario2.map((t, i) => t / filteredLabels[i]);
    const filteredProcTimePerSamplePerFreq = filteredProcTimePerSample.map(t => t / 6);

    updateLatencyChart(filteredLabels, filteredLatencyS1, filteredLatencyS2);
    updateTransmissionChart(filteredLabels, filteredTransScenario1, filteredTransScenario2, filteredProcScenario2, filteredProcTimePerSample, filteredProcTimePerSamplePerFreq);
    updateLatencyTable(filteredLabels, filteredLatencyS1, filteredLatencyS2, filteredReductionPercent);
  };

  const handleDataSizeSelection = (dataSize) => {
    setSelectedDataSizes(prev => {
      if (prev.includes(dataSize)) {
        return prev.filter(size => size !== dataSize);
      } else {
        return [...prev, dataSize];
      }
    });
  };

  const latencyTableColumns = [
    { key: 'dataSize', label: 'Data Size' },
    { key: 'scenario1', label: 'Scenario 1 (Raw Data) Latency (ms)' },
    { key: 'scenario2', label: 'Scenario 2 (Goertzel) Latency (ms)' },
    { key: 'reduction', label: 'Reduction Percentage (%)' }
  ];

  return (
    <div>
      <Header 
        title="IoT Predictive Maintenance Analysis Platform"
        subtitle="Latency Analysis"
        titleIcon="bi-gear"
        subtitleIcon="bi-stopwatch"
      />

      <div className="analysis-section">
        <h4>Analysis Parameters</h4>
        
        <div className="form-group data-selection">
          <label>Select Data Size for Analysis:</label>
          <div className="data-select-container">
            {[100, 250, 480, 600, 1000].map(size => (
              <button
                key={size}
                className={`data-option ${selectedDataSizes.includes(size) ? 'selected' : ''}`}
                onClick={() => handleDataSizeSelection(size)}
              >
                {size}
              </button>
            ))}
          </div>
          
          {selectedDataSizes.length > 0 && (
            <div className="selected-datasizes active">
              <label>Selected Data Sizes for Analysis:</label>
              <div>{selectedDataSizes.join(', ')}</div>
            </div>
          )}
        </div>

        <h4>Latency Analysis: Scenarios Comparison</h4>
        <div className="chart-wrapper">
          <div className="chart-container">
            <ChartControls
              onDownload={() => latencyChartControls.downloadChart('latency_chart.png')}
              onFullScreen={latencyChartControls.toggleFullScreen}
              onZoomIn={latencyChartControls.zoomIn}
              onZoomOut={latencyChartControls.zoomOut}
              onAutoscale={latencyChartControls.autoscale}
              onZoomSelect={latencyChartControls.zoomSelect}
              onReset={latencyChartControls.resetZoom}
              chartInstance={latencyChartInstance.current}
            />
            <canvas ref={latencyChartRef}></canvas>
          </div>
        </div>

        <h4>Transmission, Reception, and Processing Time Comparison</h4>
        <div className="chart-wrapper">
          <div className="chart-container">
            <ChartControls
              onDownload={() => transmissionChartControls.downloadChart('transmission_chart.png')}
              onFullScreen={transmissionChartControls.toggleFullScreen}
              onZoomIn={transmissionChartControls.zoomIn}
              onZoomOut={transmissionChartControls.zoomOut}
              onAutoscale={transmissionChartControls.autoscale}
              onZoomSelect={transmissionChartControls.zoomSelect}
              onReset={transmissionChartControls.resetZoom}
              chartInstance={transmissionChartInstance.current}
            />
            <canvas ref={transmissionChartRef}></canvas>
          </div>
        </div>

        <div className="table-wrapper">
          <h4>Latency Comparison Results</h4>
          <DataTable
            data={latencyTableData}
            columns={latencyTableColumns}
            
            onDownloadCsv={() => {}}
            onFullScreen={handleTableFullScreen}
            ref={latencyTableRef}
          />
        </div>
      </div>
    </div>
  );
};

export default LatencyAnalysis;