import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-zoom';
import Header from '../components/common/Header';
import ChartControls from '../components/charts/ChartControls';
import { useChartControls } from '../hooks/useChartControls';
import zoomPlugin from 'chartjs-plugin-zoom';
import DataTable from '../components/tables/DataTable';

const AlgorithmsAnalysis = () => {
  const [rawData, setRawData] = useState([]);
  const [goertzelData, setGoertzelData] = useState([]);
  const [freqLimit, setFreqLimit] = useState(1500);
  const [selectedFreqs, setSelectedFreqs] = useState([]);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [showRunButton, setShowRunButton] = useState(true);
  const [comparisonPlotter, setComparisonPlotter] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [powerResultsData, setPowerResultsData] = useState([]);
  Chart.register(zoomPlugin);

  // Chart refs
  const comparisonChartRef = useRef(null);
  const powerChartRef = useRef(null);
  const correlationChartRef = useRef(null);
  const comparisonChartInstance = useRef(null);
  const powerChartInstance = useRef(null);
  const correlationChartInstance = useRef(null);
  const powerTableRef = useRef(null);
  const comparisonTableRef = useRef(null);

  const powerChartControls = useChartControls(powerChartInstance, powerChartRef);
  const comparisonChartControls = useChartControls(comparisonChartInstance, comparisonChartRef);
  const correlationChartControls = useChartControls(correlationChartInstance, correlationChartRef);

  // Constants
  const VCC = 3.0;
  const SENSITIVITY = 0.56;
  const ADC_MAX = 1023;
  const k = VCC / (SENSITIVITY * ADC_MAX);
  const k_squared = k ** 2;
  const MS_FACTOR = 96.1704;

  // Fullscreen handlers for tables
  const handlePowerTableFullScreen = () => {
    if (!document.fullscreenElement) {
      powerTableRef.current
        .requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen for power table:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }
  };

  const handleComparisonTableFullScreen = () => {
    if (!document.fullscreenElement) {
      comparisonTableRef.current
        .requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen for comparison table:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const scenario1Data = JSON.parse(localStorage.getItem('scenario1Data')) || [];
    const scenario2Data = JSON.parse(localStorage.getItem('scenario2Data')) || [];
    setRawData(scenario1Data);
    setGoertzelData(scenario2Data);
  }, []);

  // Goertzel Comparison Plotter Class
  class GoertzelComparisonPlotter {
    constructor(comparisonCanvas, powerCanvas, correlationCanvas) {
      this.comparisonCanvas = comparisonCanvas;
      this.powerCanvas = powerCanvas;
      this.correlationCanvas = correlationCanvas;
      this.VCC = 3.0;
      this.SENSITIVITY = 0.56;
      this.ADC_BITS = 10;
      this.ADC_MAX = Math.pow(2, this.ADC_BITS) - 1;
      this.ZERO_OFFSET = 512;
      this.N_ALGORITHMS = 480;
      this.k_web = this.VCC / (this.SENSITIVITY * this.ADC_MAX);
      this.k_squared_web = this.k_web ** 2;
      this.MS_FACTOR_WEB = 96.1704;
    }

    adcToAcceleration(adcValue) {
      const accel = ((adcValue - this.ZERO_OFFSET) / this.ADC_MAX) * this.VCC / this.SENSITIVITY;
      return accel;
    }

    adcPowerToAccelerationPower(adcPower) {
      const scaleFactor = Math.pow(this.VCC / (this.ADC_MAX * this.SENSITIVITY), 2);
      const power = adcPower * scaleFactor;
      return power;
    }

    calculatePowerWebApp(Q0, Q1, Q2, c, fixedPointShift = 18, N = 480) {
      const a = Q1 * Q1;
      const b = Q2 * Q2;
      const c_term = Math.floor((c * Q1 * Q2) / Math.pow(2, 13));
      let integerPower = Math.floor((a + b - c_term) / Math.pow(2, fixedPointShift));
      if (integerPower < 0) integerPower = 0;
      const power = integerPower * Math.pow(2.0 / N, 2);
      return power;
    }

    goertzel(x, targetFreq, fs, N) {
      const k = Math.round(N * targetFreq / fs);
      const w = (2.0 * Math.PI * k) / N;
      const coeff = 2.0 * Math.cos(w);
      let Q0 = 0, Q1 = 0, Q2 = 0;

      for (let n = 0; n < N; n++) {
        Q0 = x[n] + coeff * Q1 - Q2;
        Q2 = Q1;
        Q1 = Q0;
      }

      const power = (Q1 * Q1 + Q2 * Q2 - coeff * Q1 * Q2) * Math.pow(2.0 / N, 2);
      const accelPower = this.adcPowerToAccelerationPower(power);
      return accelPower;
    }

    simpleFFT(x, fs, targetFrequencies) {
      const N = x.length;
      const fftResult = new Array(Math.floor(N / 2));

      for (let k = 0; k < Math.floor(N / 2); k++) {
        let real = 0, imag = 0;
        for (let n = 0; n < N; n++) {
          const angle = -2 * Math.PI * k * n / N;
          real += x[n] * Math.cos(angle);
          imag += x[n] * Math.sin(angle);
        }
        const magnitude = Math.sqrt(real * real + imag * imag);
        fftResult[k] = Math.pow(2.0 / N * magnitude, 2);
      }

      fftResult[0] = 0; // Remove DC component
      const fSeries = Array.from({ length: fftResult.length }, (_, i) => i * fs / N);
      const fftPowers = targetFrequencies.map(freq => {
        const idx = fSeries.reduce((bestIdx, f, i) => 
          Math.abs(f - freq) < Math.abs(fSeries[bestIdx] - freq) ? i : bestIdx, 0
        );
        return fftResult[idx];
      });

      return { fftSeries: fftResult, fSeries, fftPowers };
    }

    calculateWebAppPowers(goertzelData, freqLimit) {
      const powerResultsData = [];
      for (let i = 0; i < goertzelData.length; i++) {
        const { freq, c, q0, q1, q2 } = goertzelData[i];
        if (freq <= freqLimit) {
          const power_adc = this.calculatePowerWebApp(q0, q1, q2, c !== undefined ? c : 0, 18, this.N_ALGORITHMS);
          const power_g = power_adc * this.k_squared_web;
          const power_ms = power_g * this.MS_FACTOR_WEB;
          powerResultsData.push({ freq, c, q0, q1, q2, power_adc, power_g, power_ms });
        }
      }
      return powerResultsData;
    }

    createComparisonPlot(rawData, goertzelData, samplingRate = 10923, freqLimit = 1500, selectedFreqs = []) {
      try {
        const xSeriesG = rawData.slice(0, this.N_ALGORITHMS).map(val => this.adcToAcceleration(Number(val)));

        let msp430Frequencies = goertzelData.map(item => item.freq).filter(freq => freq <= freqLimit);
        if (selectedFreqs.length > 0) {
          msp430Frequencies = msp430Frequencies.filter(freq => selectedFreqs.includes(freq));
        }

        const webAppPowersData = this.calculateWebAppPowers(goertzelData, freqLimit);
        let msp430PowersCalculated = webAppPowersData.map(item => item.power_g).filter((_, i) => msp430Frequencies.includes(goertzelData[i].freq));

        const magnitudeBasic = msp430Frequencies.map(freq => 
          this.goertzel(rawData, freq, samplingRate, rawData.length)
        );

        const { fftSeries, fSeries, fftPowers } = this.simpleFFT(xSeriesG, samplingRate, msp430Frequencies);

        if (comparisonChartInstance.current) {
          comparisonChartInstance.current.destroy();
        }

        const ctx = this.comparisonCanvas.getContext('2d');
        comparisonChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: fSeries.filter(f => f <= freqLimit),
            datasets: [
              {
                label: 'FFT Power Spectrum',
                data: fftSeries.slice(0, fSeries.findIndex(f => f > freqLimit) || fftSeries.length),
                borderColor: 'rgba(54, 162, 235, 1.0)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
              },
              {
                label: 'Goertzel in Sensor Node (Web App Calculated)',
                data: msp430Frequencies.map((freq, i) => ({
                  x: freq,
                  y: msp430PowersCalculated[i]
                })),
                borderColor: 'green',
                backgroundColor: 'green',
                borderWidth: 2,
                pointStyle: 'cross',
                pointRadius: 8,
                showLine: false,
                type: 'scatter'
              },
              {
                label: 'Basic Goertzel in Edge Device',
                data: msp430Frequencies.map((freq, i) => ({
                  x: freq,
                  y: magnitudeBasic[i]
                })),
                borderColor: 'orange',
                backgroundColor: 'orange',
                borderWidth: 2,
                pointStyle: 'circle',
                pointRadius: 6,
                showLine: false,
                type: 'scatter'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                min: 0,
                max: freqLimit,
                title: {
                  display: true,
                  text: 'Frequency (Hz)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Power (g²)'
                },
                beginAtZero: true
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Goertzel Comparison: (Edge Device vs Sensor Node)'
              },
              legend: {
                position: 'top'
              },
              datalabels: { display: false }
            }
          }
        });

        return {
          frequencies: msp430Frequencies,
          fftPowers: fftPowers,
          edgeDevicePowers: magnitudeBasic,
          sensorNodePowers: msp430PowersCalculated,
          differences: magnitudeBasic.map((g, i) => 
            g !== 0 ? ((msp430PowersCalculated[i] - g) / g * 100) : 0
          )
        };

      } catch (error) {
        console.error('Error creating comparison plot:', error);
        throw error;
      }
    }

    createPowerChart(powerResultsData, freqLimit) {
      if (powerChartInstance.current) {
        powerChartInstance.current.destroy();
      }

      const ctx = this.powerCanvas.getContext('2d');
      powerChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: powerResultsData.map(item => item.freq).filter(freq => freq <= freqLimit),
          datasets: [{
            label: 'Power (g²)',
            data: powerResultsData.map(item => item.power_g).filter((_, i) => powerResultsData[i].freq <= freqLimit),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: false,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Frequency (Hz)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Power (g²)'
              },
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Power Spectrum (g² vs Frequency)'
            },
            legend: {
              position: 'top'
            },
            datalabels: { display: false }
          }
        }
      });
    }

    createCorrelationPlot(comparisonData) {
      const { frequencies, edgeDevicePowers, sensorNodePowers } = comparisonData;
      if (correlationChartInstance.current) {
        correlationChartInstance.current.destroy();
      }

      const maxPower = Math.max(0.02, ...edgeDevicePowers, ...sensorNodePowers) * 1.3;

      const ctx = this.correlationCanvas.getContext('2d');
      correlationChartInstance.current = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Data Points',
            data: frequencies.map((freq, i) => ({ x: edgeDevicePowers[i], y: sensorNodePowers[i] })),
            backgroundColor: 'rgba(0, 128, 0, 0.7)',
            pointRadius: 5,
            pointHoverRadius: 7
          }, {
            label: 'Perfect Correlation',
            data: [{ x: 0, y: 0 }, { x: maxPower, y: maxPower }],
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [5, 5],
            showLine: true,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Edge Device Goertzel Power (g²)' },
              beginAtZero: true,
              max: maxPower
            },
            y: {
              title: { display: true, text: 'Sensor Node Goertzel Power (g²)' },
              beginAtZero: true,
              max: maxPower
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Correlation: Edge Device (Python) vs Sensor Node (MSP430)'
            },
            legend: { position: 'top' },
            datalabels: { display: false },
            tooltip: {
              callbacks: {
                label: context => {
                  const freq = frequencies[context.dataIndex];
                  return `${freq} Hz: (${context.raw.x.toFixed(5)}, ${context.raw.y.toFixed(5)})`;
                }
              }
            }
          }
        }
      });
    }
  }

  const calculatePower = (Q0, Q1, Q2, c, fixedPointShift = 18, N = 480) => {
    const a = BigInt(Q1) * BigInt(Q1);
    const b = BigInt(Q2) * BigInt(Q2);
    const c_term = (BigInt(c !== undefined ? c : 0) * BigInt(Q1) * BigInt(Q2)) >> BigInt(13);
    let integerPower = (a + b - c_term) >> BigInt(fixedPointShift);
    if (integerPower < 0) integerPower = BigInt(0);
    const power = Number(integerPower) * (2.0 / N) ** 2;
    return power;
  };

  const handleRunAnalysis = () => {
    if (!rawData || !goertzelData.length) {
      alert('No data available. Please upload or fetch data in the Data Upload & Processing page.');
      return;
    }

    try {
      let parsedRawData = rawData;

      if (typeof parsedRawData === 'string') {
        parsedRawData = parsedRawData.split(',').map(val => Number(val.trim())).filter(val => !isNaN(val));
      } else if (Array.isArray(parsedRawData) && parsedRawData.length === 1 && typeof parsedRawData[0] === 'string') {
        parsedRawData = parsedRawData[0].split(',').map(val => Number(val.trim())).filter(val => !isNaN(val));
      } else if (Array.isArray(parsedRawData) && Array.isArray(parsedRawData[0])) {
        parsedRawData = parsedRawData[0].map(val => Number(val)).filter(val => !isNaN(val));
      } else {
        parsedRawData = parsedRawData.map(val => Number(val)).filter(val => !isNaN(val));
      }

      if (parsedRawData.length < 480) {
        throw new Error(`Insufficient raw data samples: ${parsedRawData.length}. Expected at least 480.`);
      }

      setRawData(parsedRawData);

      const powerResults = [];
      for (let i = 0; i < goertzelData.length; i++) {
        const { freq, c, q0, q1, q2 } = goertzelData[i];
        const power_adc = calculatePower(q0, q1, q2, c !== undefined ? c : 0);
        const power_g = power_adc * k_squared;
        const power_ms = power_g * MS_FACTOR;
        powerResults.push({ freq, c, q0, q1, q2, power_adc, power_g, power_ms });
      }
      setPowerResultsData(powerResults);

      setShowRunButton(false);
      setAnalysisVisible(true);

      setTimeout(() => {
        if (comparisonChartRef.current && powerChartRef.current && correlationChartRef.current) {
          const plotter = new GoertzelComparisonPlotter(
            comparisonChartRef.current,
            powerChartRef.current,
            correlationChartRef.current
          );
          setComparisonPlotter(plotter);

          plotter.createPowerChart(powerResults, freqLimit);
          const initialData = plotter.createComparisonPlot(parsedRawData, goertzelData, 10923, freqLimit, selectedFreqs);
          plotter.createCorrelationPlot(initialData);
          setComparisonData(initialData);
        }
      }, 100);
    } catch (error) {
      console.error('Error in analysis:', error);
      alert('Error running analysis. Check console for details.');
    }
  };

  const handleFreqLimitChange = (e) => {
    const newLimit = Math.max(500, Math.min(3000, parseInt(e.target.value)));
    setFreqLimit(newLimit);

    if (comparisonPlotter && rawData.length > 0) {
      setTimeout(() => {
        comparisonPlotter.createPowerChart(powerResultsData, newLimit);
        const newData = comparisonPlotter.createComparisonPlot(rawData, goertzelData, 10923, newLimit, selectedFreqs);
        comparisonPlotter.createCorrelationPlot(newData);
        setComparisonData(newData);
      }, 0);
    }
  };

  const handleFreqSelection = (freq) => {
    setSelectedFreqs(prev => {
      const newSelection = prev.includes(freq)
        ? prev.filter(f => f !== freq)
        : [...prev, freq];

      if (comparisonPlotter && rawData.length > 0) {
        setTimeout(() => {
          const newData = comparisonPlotter.createComparisonPlot(rawData, goertzelData, 10923, freqLimit, newSelection);
          comparisonPlotter.createCorrelationPlot(newData);
          setComparisonData(newData);
        }, 0);
      }

      return newSelection;
    });
  };

  // Data and columns for Power Calculations table
  const powerTableColumns = [
    { key: 'freq', label: 'Frequency (Hz)' },
    { key: 'c', label: 'Coefficient' },
    { key: 'q0', label: 'Q0' },
    { key: 'q1', label: 'Q1' },
    { key: 'q2', label: 'Q2' },
    { key: 'power_adc', label: 'Power (ADC counts)²', format: value => value.toFixed(6) },
    { key: 'power_g', label: 'Power (g²)', format: value => value.toFixed(6) },
    { key: 'power_ms', label: 'Power ((m/s²)²)', format: value => value.toFixed(6) },
  ];

  // Data and columns for Comparison Results table
  const comparisonTableColumns = [
    { key: 'freq', label: 'Frequency (Hz)' },
    { key: 'fftPower', label: 'FFT Power (g²)', format: value => value?.toFixed(5) || 'N/A' },
    { key: 'edgeDevicePower', label: 'Goertzel Power (Edge Device, g²)', format: value => value?.toFixed(5) || 'N/A' },
    { key: 'sensorNodePower', label: 'Goertzel Power (Sensor Node, g²)', format: value => value?.toFixed(5) || 'N/A' },
    { key: 'difference', label: 'Difference (%)', format: value => value?.toFixed(1) + '%' || 'N/A' },
  ];

  const comparisonTableData = comparisonData
    ? comparisonData.frequencies.map((freq, i) => ({
        freq,
        fftPower: comparisonData.fftPowers[i],
        edgeDevicePower: comparisonData.edgeDevicePowers[i],
        sensorNodePower: comparisonData.sensorNodePowers[i],
        difference: comparisonData.differences[i],
      }))
    : [];

  const frequencies = goertzelData.map(item => item.freq).filter(freq => freq >= 500 && freq <= 3000);

  return (
    <div>
      <Header 
        title="IoT Predictive Maintenance Analysis Platform"
        subtitle="FFT vs Goertzel Analysis"
        titleIcon="bi-gear"
        subtitleIcon="bi-bar-chart"
      />

      <div className="container-flex">
        {showRunButton && (
          <button 
            className="btn btn-outline-primary mb-4"
            style={{ display: 'block', margin: '0 auto' }}
            onClick={handleRunAnalysis}
          >
            <i className="bi bi-gear"></i> Run Comprehensive Analysis
          </button>
        )}

        {analysisVisible && (
          <div className="scenario">
            <h4>
              <i className="bi bi-bar-chart" style={{ color: '#007bff' }}></i> 
              Data and Power Calculations
            </h4>

            <h5 className="blue-title">Power to Acceleration Conversion Parameters</h5>
            <div className="parameter-block">
              <div className="parameter-container horizontal">
                <span className="parameter-title">Supply Voltage VCC (V):</span>
                <span className="parameter-value">3 V</span>
              </div>
              <div className="parameter-container horizontal">
                <span className="parameter-title">Sensor Sensitivity (V/g):</span>
                <span className="parameter-value">0.56</span>
              </div>
              <div className="parameter-container horizontal">
                <span className="parameter-title">ADC Bits:</span>
                <span className="parameter-value">10-bit</span>
              </div>
              <div className="parameter-container horizontal">
                <span className="parameter-title">ADC_MAX:</span>
                <span className="parameter-value">1023</span>
              </div>
            </div>

            <div className="chart-wrapper">
              <div className="chart-container">
                <h5 className="blue-title power-spectrum-title">Power Spectrum (Goertzel power vs Frequency)</h5>
                <ChartControls
                  onDownload={() => powerChartControls.downloadChart('power_spectrum.png')}
                  onFullScreen={powerChartControls.toggleFullScreen}
                  onZoomIn={powerChartControls.zoomIn}
                  onZoomOut={powerChartControls.zoomOut}
                  onAutoscale={powerChartControls.autoscale}
                  onZoomSelect={powerChartControls.zoomSelect}
                  onReset={powerChartControls.resetZoom}
                  chartInstance={powerChartInstance.current}
                />
                <canvas 
                  ref={powerChartRef}
                  style={{ height: '400px', width: '100%' }}
                ></canvas>
              </div>
            </div>

            <div className="data-display">
              <h4>Power Calculations</h4>
              <DataTable
                data={powerResultsData}
                columns={powerTableColumns}
               
                onDownloadCsv={() => {}}
                onFullScreen={handlePowerTableFullScreen}
                ref={powerTableRef}
              />
            </div>

            <h4 className="fft-goertzel-title">
              <i className="bi bi-bar-chart" style={{ color: '#000000' }}></i> 
              FFT vs Goertzel Algorithm Comparison
            </h4>

            <h5 className="blue-title">Analysis Parameters</h5>
            <div className="initial-stats">
              <div className="stat-item">
                <div className="stat-label">Data Points</div>
                <div className="stat-value">{rawData.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Sampling Rate (Hz)</div>
                <div className="stat-value">10923</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Target Frequencies</div>
                <div className="stat-value">{goertzelData.length}</div>
              </div>
            </div>

            <div className="analysis-parameters">
              <div className="freq-limit">
                <label>Frequency Limit (Hz):</label>
                <input 
                  type="range" 
                  min="500" 
                  max="3000" 
                  value={freqLimit}
                  step="1"
                  onChange={handleFreqLimitChange}
                />
                <span>{freqLimit} Hz</span>
              </div>
              
              <div className="freq-selection">
                <label>Frequency Selection:</label>
                <div className="freq-select-container">
                  {frequencies.map(freq => (
                    <button
                      key={freq}
                      className={`freq-option ${selectedFreqs.includes(freq) ? 'selected' : ''}`}
                      onClick={() => handleFreqSelection(freq)}
                    >
                      {freq} Hz
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedFreqs.length > 0 && (
                <div className="selected-freqs active">
                  <label>Selected Frequencies for Analysis (Hz):</label>
                  <div>{selectedFreqs.join(', ')}</div>
                </div>
              )}
            </div>

            <div className="chart-wrapper">
              <div className="chart-container">
                <h5 className="blue-title">Goertzel Comparison Plot (Real-time)</h5>
                <ChartControls
                  onDownload={() => comparisonChartControls.downloadChart('comparison_plot.png')}
                  onFullScreen={comparisonChartControls.toggleFullScreen}
                  onZoomIn={comparisonChartControls.zoomIn}
                  onZoomOut={comparisonChartControls.zoomOut}
                  onAutoscale={comparisonChartControls.autoscale}
                  onZoomSelect={comparisonChartControls.zoomSelect}
                  onReset={comparisonChartControls.resetZoom}
                  chartInstance={comparisonChartInstance.current}
                />
                <canvas 
                  ref={comparisonChartRef}
                  style={{ height: '400px', width: '100%' }}
                ></canvas>
              </div>
            </div>

            {comparisonData && (
              <div className="data-display">
                <h4>Comparison of Goertzel and FFT Results (Edge Device vs Sensor Node)</h4>
                <DataTable
                  data={comparisonTableData}
                  columns={comparisonTableColumns}
                  
                  onDownloadCsv={() => {}}
                  onFullScreen={handleComparisonTableFullScreen}
                  ref={comparisonTableRef}
                />
              </div>
            )}

            <div className="correlation-plot">
              <h4>
                <i className="bi bi-bar-chart" style={{ color: '#28a745' }}></i> 
                Correlation Analysis
              </h4>
              <div className="chart-container">
                <h5 className="blue-title">Correlation: Edge Device (Python) vs Sensor Node (MSP430)</h5>
                <ChartControls
                  onDownload={() => correlationChartControls.downloadChart('correlation_plot.png')}
                  onFullScreen={correlationChartControls.toggleFullScreen}
                  onZoomIn={correlationChartControls.zoomIn}
                  onZoomOut={correlationChartControls.zoomOut}
                  onAutoscale={correlationChartControls.autoscale}
                  onZoomSelect={correlationChartControls.zoomSelect}
                  onReset={correlationChartControls.resetZoom}
                  chartInstance={correlationChartInstance.current}
                />
                <canvas 
                  ref={correlationChartRef}
                  style={{ height: '600px', width: '100%' }}
                ></canvas>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmsAnalysis;