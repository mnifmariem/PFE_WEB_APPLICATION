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

// Helper to compute regression line points
const getRegressionPoints = (slope, intercept, xVals) =>
  xVals.map(x => ({ x, y: slope * x + intercept }));

const EnergyAnalysis = () => {
  const [selectedDataSizes, setSelectedDataSizes] = useState([]);
  const [energyData, setEnergyData] = useState([]); // Array of data rows
  const [regression, setRegression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      const response = await getEnergyAnalysis();
      // Defensive checks
      if (
        response &&
        response.analysis &&
        Array.isArray(response.analysis.data)
      ) {
        setEnergyData(response.analysis.data);
        setRegression(response.analysis.regression ?? null);
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

  const regressionPoints1 =
    canShowRegression
      ? getRegressionPoints(
          regression.scenario1.slope,
          regression.scenario1.intercept,
          filteredData.map(d => d.dataSize)
        )
      : [];

  const regressionPoints2 =
    canShowRegression
      ? getRegressionPoints(
          regression.scenario2.slope,
          regression.scenario2.intercept,
          filteredData.map(d => d.dataSize)
        )
      : [];

  // For SavingsTrendChart
  const savingsTrendLabels = filteredData.map(item => item.dataSize);
  const savingsTrendData = filteredData.map(item => item.savingsPercentage);

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
                scenario2: filteredData.map(item => item.scenario2Energy)
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
                  scenario2: filteredData.map(item => item.scenario2Energy)
                }}
                regression1={regressionPoints1}
                regression2={regressionPoints2}
                r2_1={regression.scenario1.r2}
                r2_2={regression.scenario2.r2}
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
                {
                  key: 'energySavings',label: 'Energy Savings (mJ)',format: (val) =>val != null ? val.toFixed(6) : ''
                },
                {
                  key: 'savingsPercentage',label: 'Savings Percentage (%)',format: (val) =>val != null ? val.toFixed(6) : ''
                   
                }
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