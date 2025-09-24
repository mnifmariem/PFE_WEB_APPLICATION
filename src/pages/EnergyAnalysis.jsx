// src/pages/EnergyAnalysis.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import EnergyChart from '../components/charts/EnergyChart';
import DataTable from '../components/tables/DataTable';
import { getEnergyAnalysis } from '../services/analysisService';


const EnergyAnalysis = () => {
  const [selectedDataSizes, setSelectedDataSizes] = useState([]);
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const dataSizeOptions = [100, 250, 480, 600, 1000];

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      const data = await getEnergyAnalysis();
      setEnergyData(data);
    } catch (error) {
      console.error('Error loading energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataSizeToggle = (size) => {
    setSelectedDataSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const getFilteredData = () => {
    if (!energyData || selectedDataSizes.length === 0) {
      return energyData;
    }
    
    return {
      ...energyData,
      data: energyData.data.filter(item => 
        selectedDataSizes.includes(item.dataSize)
      )
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredData = getFilteredData();

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
            {dataSizeOptions.map(size => (
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

        {filteredData && (
          <>
            <EnergyChart 
              data={{
                dataSizes: filteredData.data.map(item => item.dataSize),
                scenario1: filteredData.data.map(item => item.scenario1Energy),
                scenario2: filteredData.data.map(item => item.scenario2Energy)
              }}
              onDownload={() => {/* implement download */}}
              onFullScreen={() => {/* implement fullscreen */}}
            />
            
            <DataTable
              data={filteredData.data}
              columns={[
                { key: 'dataSize', label: 'Data Size' },
                { key: 'scenario1Energy', label: 'Scenario1 (Raw Data) Energy (mJ)', format: (val) => val.toFixed(6) },
                { key: 'scenario2Energy', label: 'Scenario2 (Goertzel) Energy (mJ)', format: (val) => val.toFixed(6) },
                { key: 'energySavings', label: 'Energy Savings (mJ)', format: (val) => val.toFixed(6) },
                { key: 'savingsPercentage', label: 'Savings Percentage (%)', format: (val) => val.toFixed(1) }
              ]}
             
              onDownloadCsv={() => {/* implement CSV download */}}
              onFullScreen={() => {/* implement fullscreen */}}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EnergyAnalysis;