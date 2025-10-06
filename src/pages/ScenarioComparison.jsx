import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-zoom';
import 'chartjs-plugin-annotation';
import Header from '../components/common/Header';
import DataTable from '../components/tables/DataTable';

Chart.register(ChartDataLabels);

const ScenarioComparison = () => {
  const [selectedDataSizes, setSelectedDataSizes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const pieChartsRef = useRef({});
  const compressionEfficiencyChartRef = useRef(null);
  const byteReductionChartRef = useRef(null);
  const compressionTableRef = useRef(null);

  const sample_sizes = [100, 250, 480, 600, 1000];
  const scenario1_bytes = [203, 506, 971, 1214, 2023];
  const scenario2_bytes = [72, 72, 72, 72, 72];

  const enhancedData = [
    { samples: 100, scenario1: 203, scenario2: 72, reduction: 131, reductionPct: 64.53, compressionRatio: 2.82, bytesPerSample1: 2.03, bytesPerSample2: 0.72, efficiency: 1.31 },
    { samples: 250, scenario1: 506, scenario2: 72, reduction: 434, reductionPct: 85.77, compressionRatio: 7.03, bytesPerSample1: 2.02, bytesPerSample2: 0.29, efficiency: 1.74 },
    { samples: 480, scenario1: 971, scenario2: 72, reduction: 899, reductionPct: 92.56, compressionRatio: 13.49, bytesPerSample1: 2.02, bytesPerSample2: 0.15, efficiency: 1.87 },
    { samples: 600, scenario1: 1214, scenario2: 72, reduction: 1142, reductionPct: 94.07, compressionRatio: 16.86, bytesPerSample1: 2.02, bytesPerSample2: 0.12, efficiency: 1.90 },
    { samples: 1000, scenario1: 2023, scenario2: 72, reduction: 1951, reductionPct: 96.44, compressionRatio: 28.1, bytesPerSample1: 2.02, bytesPerSample2: 0.07, efficiency: 1.95 }
  ];

  const pieChartData = sample_sizes.map((size, index) => [
    { name: 'Scenario 1', value: scenario1_bytes[index], color: '#4e92e0ff' },
    { name: 'Scenario 2', value: scenario2_bytes[index], color: '#7ED957' }
  ]);

  const handleTableFullScreen = () => {
    if (!document.fullscreenElement) {
      compressionTableRef.current
        .requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen for compression table:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }
  };

  const destroyAllCharts = () => {
    Object.values(pieChartsRef.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    pieChartsRef.current = {};

    if (compressionEfficiencyChartRef.current && typeof compressionEfficiencyChartRef.current.destroy === 'function') {
      compressionEfficiencyChartRef.current.destroy();
      compressionEfficiencyChartRef.current = null;
    }

    if (byteReductionChartRef.current && typeof byteReductionChartRef.current.destroy === 'function') {
      byteReductionChartRef.current.destroy();
      byteReductionChartRef.current = null;
    }
  };

  useEffect(() => {
    setFilteredData(enhancedData);
    
    const timer = setTimeout(() => {
      initializeCharts();
    }, 100);

    return () => {
      clearTimeout(timer);
      destroyAllCharts();
    };
  }, []);

  const initializeCharts = () => {
    destroyAllCharts();

    sample_sizes.forEach((size, index) => {
      const canvas = document.getElementById(`pieChart${size}`);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        try {
          pieChartsRef.current[size] = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Scenario 1', 'Scenario 2'],
              datasets: [{
                data: [pieChartData[index][0].value, pieChartData[index][1].value],
                backgroundColor: [pieChartData[index][0].color, pieChartData[index][1].color],
                borderColor: ['#fff', '#fff'],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              rotation: 90,
              plugins: {
                title: {
                  display: true,
                  text: `${size} Samples`,
                  font: { size: 12 }
                },
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: { font: { size: 10 } }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${context.raw} bytes`;
                    }
                  }
                },
                datalabels: {
                  display: true,
                  formatter: (value, context) => {
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(1);
                    return `${percentage}%\n(${value}B)`;
                  },
                  color: '#333',
                  font: { size: 10 },
                  anchor: 'center',
                  align: 'center',
                  textAlign: 'center'
                }
              }
            },
            plugins: [ChartDataLabels]
          });
        } catch (error) {
          console.error(`Error creating pie chart for ${size} samples:`, error);
        }
      }
    });

    const efficiencyCanvas = document.getElementById('compressionEfficiencyChart');
    if (efficiencyCanvas) {
      const ctx = efficiencyCanvas.getContext('2d');
      try {
        compressionEfficiencyChartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: enhancedData.map(row => row.samples),
            datasets: [{
              label: 'Reduction %',
              data: enhancedData.map(row => row.reductionPct),
              borderColor: '#3b82f6',
              backgroundColor: '#3b82f6',
              pointStyle: 'circle',
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 3,
              fill: false
            }]
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
                  text: 'Reduction (%)',
                  font: { size: 12 }
                },
                beginAtZero: true,
                max: 100
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Compression Efficiency Over Scale',
                font: { size: 14, weight: 'bold' }
              },
              legend: {
                position: 'top',
                labels: { font: { size: 10 } }
              },
              datalabels: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                  }
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating compression efficiency chart:', error);
      }
    }

    const reductionCanvas = document.getElementById('byteReductionChart');
    if (reductionCanvas) {
      const ctx = reductionCanvas.getContext('2d');
      try {
        byteReductionChartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: enhancedData.map(row => row.samples),
            datasets: [{
              label: 'Byte Reduction',
              data: enhancedData.map(row => row.reduction),
              backgroundColor: '#f97316',
              borderColor: '#ea580c',
              borderWidth: 1
            }]
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
                  text: 'Byte Reduction (bytes)',
                  font: { size: 12 }
                },
                beginAtZero: true
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Byte Reduction',
                font: { size: 14, weight: 'bold' }
              },
              legend: {
                position: 'top',
                labels: { font: { size: 10 } }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.raw} bytes`;
                  }
                }
              },
              datalabels: {
                anchor: 'end',
                align: 'top',
                font: { size: 10 },
                formatter: value => value
              }
            }
          },
          plugins: [ChartDataLabels]
        });
      } catch (error) {
        console.error('Error creating byte reduction chart:', error);
      }
    }
  };

  const handleDataSizeSelection = (size) => {
    const newSelected = selectedDataSizes.includes(size)
      ? selectedDataSizes.filter(s => s !== size)
      : [...selectedDataSizes, size];
    
    setSelectedDataSizes(newSelected);
    
    const filtered = newSelected.length === 0 
      ? enhancedData 
      : enhancedData.filter(row => newSelected.includes(row.samples));
    
    setFilteredData(filtered);
    updateCharts(filtered, newSelected);
  };

  const updateCharts = (data, selectedSizes) => {
    sample_sizes.forEach(size => {
      const chartContainer = document.getElementById(`pieChart${size}`)?.parentElement;
      if (chartContainer) {
        chartContainer.style.display = 
          selectedSizes.length === 0 || selectedSizes.includes(size) ? 'block' : 'none';
      }
    });

    if (compressionEfficiencyChartRef.current) {
      compressionEfficiencyChartRef.current.data.labels = data.map(row => row.samples);
      compressionEfficiencyChartRef.current.data.datasets[0].data = data.map(row => row.reductionPct);
      compressionEfficiencyChartRef.current.update();
    }

    if (byteReductionChartRef.current) {
      byteReductionChartRef.current.data.labels = data.map(row => row.samples);
      byteReductionChartRef.current.data.datasets[0].data = data.map(row => row.reduction);
      byteReductionChartRef.current.update();
    }
  };

  const compressionTableColumns = [
    { key: 'samples', label: 'Data Size (samples)' },
    { key: 'scenario1', label: 'Scenario 1 (bytes)' },
    { key: 'scenario2', label: 'Scenario 2 (bytes)' },
    { key: 'reductionPct', label: 'Reduction (%)', format: value => `${value.toFixed(1)}%` },
    { key: 'compressionRatio', label: 'Compression Ratio' },
    { key: 'bytesPerSample1', label: 'Bytes/Sample (S1)' },
    { key: 'bytesPerSample2', label: 'Bytes/Sample (S2)' },
    { key: 'efficiency', label: 'Efficiency (bytes/sample)' }
  ];

  return (
    <div>
      <Header 
        title="IoT Predictive Maintenance Analysis Platform" 
        subtitle="Scenario Comparison" 
        titleIcon="bi-gear" 
        subtitleIcon="bi-bar-chart" 
      />
      
      <div className="analysis-section">
        <h4 className="compression-analysis">Data Selection Parameters</h4>
        <div className="form-group data-selection">
          <label>Select Data Size for Analysis:</label>
          <div id="dataSelectContainer" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', overflowX: 'auto', padding: '5px 0' }}>
            {[100, 250, 480, 600, 1000].map(size => (
              <button
                key={size}
                className={`data-option ${selectedDataSizes.includes(size) ? 'selected' : ''}`}
                onClick={() => handleDataSizeSelection(size)}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  backgroundColor: selectedDataSizes.includes(size) ? '#0d6efd' : '#fff',
                  color: selectedDataSizes.includes(size) ? '#fff' : '#000',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {size}
              </button>
            ))}
          </div>
          {selectedDataSizes.length > 0 && (
            <div className="selected-datasizes active">
              <label>Selected Data Sizes for Analysis:</label>
              <div style={{ padding: '5px 10px', backgroundColor: '#e9ecef', borderRadius: '5px', overflowX: 'auto', whiteSpace: 'nowrap', minHeight: '30px' }}>
                {selectedDataSizes.join(', ')}
              </div>
            </div>
          )}
        </div>

        <h4 className="compression-analysis">Compression Analysis</h4>
        <div className="table-wrapper">
          <h5 className="table-title">Compression Metrics Table</h5>
          <DataTable
            data={filteredData}
            columns={compressionTableColumns}
            
            onDownloadCsv={() => {}}
            onFullScreen={handleTableFullScreen}
            ref={compressionTableRef}
          />
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <h4>Max Compression</h4>
            <p className="value" style={{ color: '#2563eb' }}>96.4%</p>
            <p className="desc">At 1000 samples</p>
          </div>
          <div className="insight-card">
            <h4>Best Ratio</h4>
            <p className="value" style={{ color: '#16a34a' }}>28.1</p>
            <p className="desc">Scenario 1 to 2</p>
          </div>
          <div className="insight-card">
            <h4>Constant Size</h4>
            <p className="value" style={{ color: '#9333ea' }}>72 bytes</p>
            <p className="desc">Scenario 2 always</p>
          </div>
          <div className="insight-card">
            <h4>Linear Growth</h4>
            <p className="value" style={{ color: '#ea580c' }}>~2.02</p>
            <p className="desc">Bytes per sample (S1)</p>
          </div>
        </div>

        <div className="chart-wrapper">
          <h4 className="chart-title">Data Transmission Proportions for Different Sample Sizes</h4>
          <div className="chart-controls">
            <button onClick={() => downloadChart(pieChartsRef, 'pie_charts.png')} data-bs-toggle="tooltip" title="Download PNG">
              <i className="bi bi-download"></i>
            </button>
          </div>
          <div id="pieChartsContainer" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {sample_sizes.map(size => (
              <div key={size} className="chart-container">
                <canvas id={`pieChart${size}`}></canvas>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-wrapper">
          <h4 className="chart-title">Compression Efficiency Over Scale</h4>
          <div className="chart-container">
            <div className="chart-controls">
              <button onClick={() => downloadChart(compressionEfficiencyChartRef, 'compression_efficiency.png')} data-bs-toggle="tooltip" title="Download PNG">
                <i className="bi bi-download"></i>
              </button>
            </div>
            <canvas id="compressionEfficiencyChart"></canvas>
          </div>
        </div>

        <div className="chart-wrapper byte-reduction">
          <h4 className="chart-title">Byte Reduction</h4>
          <div className="chart-container">
            <div className="chart-controls">
              <button onClick={() => downloadChart(byteReductionChartRef, 'byte_reduction.png')} data-bs-toggle="tooltip" title="Download PNG">
                <i className="bi bi-download"></i>
              </button>
            </div>
            <canvas id="byteReductionChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;