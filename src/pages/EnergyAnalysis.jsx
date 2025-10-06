import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import EnergyChart from '../components/charts/EnergyChart';
import EnergySavingChart from '../components/charts/EnergySavingChart';
import RegressionChart from '../components/charts/RegressionChart';
import SavingsTrendChart from '../components/charts/SavingsTrendChart';
import DataTable from '../components/tables/DataTable';
import { getEnergyAnalysis } from '../services/analysisService';

// Data size options for buttons
const dataSizeOptions = [100, 250, 480, 600, 1000];
const futureSizes = [1500, 2000, 3000, 5000, 10000, 100000, 400000];

// Helper to compute regression line points
const getRegressionPoints = (slope, intercept, xVals) =>
  xVals.map(x => ({ x, y: slope * x + intercept }));

// Linear regression calculation
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

// R² score calculation
const r2Score = (yTrue, yPred) => {
  const meanY = yTrue.reduce((a, b) => a + b) / yTrue.length;
  const ssTot = yTrue.reduce((a, b) => a + (b - meanY) ** 2, 0);
  const ssRes = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0);
  return 1 - (ssRes / ssTot);
};

const EnergyAnalysis = () => {
  const [selectedDataSizes, setSelectedDataSizes] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [regression, setRegression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      const response = await getEnergyAnalysis();
      if (
        response &&
        response.analysis &&
        Array.isArray(response.analysis.data)
      ) {
        const data = response.analysis.data;
        setEnergyData(data);

        // Compute regression if not provided
        const dataSizes = data.map(item => item.dataSize);
        const scenario1 = data.map(item => item.scenario1Energy);
        const scenario2 = data.map(item => item.scenario2Energy);

        const model1 = linearRegression(dataSizes, scenario1);
        const model2 = linearRegression(dataSizes, scenario2);

        const pred1 = dataSizes.map(x => model1.slope * x + model1.intercept);
        const pred2 = dataSizes.map(x => model2.slope * x + model2.intercept);

        const r2_1 = r2Score(scenario1, pred1);
        const r2_2 = r2Score(scenario2, pred2);

        setRegression({
          scenario1: { slope: model1.slope, intercept: model1.intercept, r2: r2_1 },
          scenario2: { slope: model2.slope, intercept: model2.intercept, r2: r2_2 },
        });
      } else {
        setEnergyData([]);
        setRegression(null);
        console.error("API response.analysis.data is not an array!", response);
      }
    } catch (error) {
      setEnergyData([]);
      setRegression(null);
      console.error('Error loading energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataSizeToggle = (size) => {
    setSelectedDataSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const getFilteredData = () => {
    if (!energyData || energyData.length === 0 || selectedDataSizes.length === 0) {
      return energyData;
    }
    return energyData.filter(item =>
      selectedDataSizes.includes(item.dataSize)
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredData = getFilteredData();

  // Prepare regression chart data
  const canShowRegression =
    regression &&
    regression.scenario1 &&
    regression.scenario2 &&
    filteredData &&
    filteredData.length > 0;

  // Extended data sizes for smooth regression lines
  const extendedDataSizes = Array.from({ length: 300 }, (_, i) => 100 + (500000 - 100) * i / 299);
  const regressionPoints1 = canShowRegression
    ? getRegressionPoints(regression.scenario1.slope, regression.scenario1.intercept, extendedDataSizes)
    : [];
  const regressionPoints2 = canShowRegression
    ? getRegressionPoints(regression.scenario2.slope, regression.scenario2.intercept, extendedDataSizes)
    : [];

  // Predictive points for future sizes
  const futurePred1 = canShowRegression
    ? futureSizes.map(x => regression.scenario1.slope * x + regression.scenario1.intercept)
    : [];
  const futurePred2 = canShowRegression
    ? futureSizes.map(x => regression.scenario2.slope * x + regression.scenario2.intercept)
    : [];

  // For SavingsTrendChart
  const savingsTrendLabels = [...filteredData.map(item => item.dataSize), ...futureSizes];
  const savingsTrendData = [
    ...filteredData.map(item => item.savingsPercentage),
    ...futureSizes.map((size, i) => {
      const e1 = futurePred1[i];
      const e2 = futurePred2[i];
      return (e1 - e2) / e1 * 100;
    }),
  ];

  return (
    <div>
      <Header
        title="IoT Predictive Maintenance Analysis Platform"
        subtitle="Energy Consumption Analysis"
        titleIcon="bi-gear"
        subtitleIcon="bi-lightning-fill"
      />

      <div className="analysis-section">
        <h4>Analysis Parameters</h4>
        <div className="form-group data-selection">
          <label>Select Data Size for Analysis</label>
          <div id="dataSelectContainer">
            {dataSizeOptions.map((size) => (
              <button
                key={size}
                className={`data-option ${selectedDataSizes.includes(size) ? 'selected' : ''}`}
                onClick={() => handleDataSizeToggle(size)}
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

        {filteredData && filteredData.length > 0 && (
          <>
            <EnergyChart
              data={{
                dataSizes: filteredData.map(item => item.dataSize),
                scenario1: filteredData.map(item => item.scenario1Energy),
                scenario2: filteredData.map(item => item.scenario2Energy),
              }}
            />

            <EnergySavingChart
              dataSizes={filteredData.map(item => item.dataSize)}
              savingsPercent={filteredData.map(item => item.savingsPercentage)}
            />

            {canShowRegression && (
              <RegressionChart
                data={{
                  dataSizes: filteredData.map(item => item.dataSize),
                  scenario1: filteredData.map(item => item.scenario1Energy),
                  scenario2: filteredData.map(item => item.scenario2Energy),
                }}
                regression1={regressionPoints1}
                regression2={regressionPoints2}
                r2_1={regression.scenario1.r2}
                r2_2={regression.scenario2.r2}
                futureSizes={futureSizes}
                futurePred1={futurePred1}
                futurePred2={futurePred2}
              />
            )}

            <SavingsTrendChart
              labels={savingsTrendLabels}
              savingsPercent={savingsTrendData}
            />

            <DataTable
              data={filteredData}
              columns={[
                { key: 'dataSize', label: 'Data Size' },
                { key: 'scenario1Energy', label: 'Scenario1 (Raw Data) Energy (mJ)', format: (val) => val != null ? val.toFixed(6) : '' },
                { key: 'scenario2Energy', label: 'Scenario2 (Goertzel) Energy (mJ)', format: (val) => val != null ? val.toFixed(6) : '' },
                { key: 'energySavings', label: 'Energy Savings (mJ)', format: (val) => val != null ? val.toFixed(6) : '' },
                { key: 'savingsPercentage', label: 'Savings Percentage (%)', format: (val) => val != null ? val.toFixed(1) : '' },
              ]}
              title="Energy Saving Analysis"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EnergyAnalysis;