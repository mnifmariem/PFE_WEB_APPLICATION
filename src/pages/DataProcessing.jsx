// src/pages/DataProcessing.jsx
import React, { useState } from 'react';
import Header from '../components/common/Header';
import SerialConnection from '../components/data/SerialConnection';
import DataUpload from '../components/data/DataUpload';
import DataPreview from '../components/data/DataPreview';

const DataProcessing = () => {
  const [scenario1Data, setScenario1Data] = useState(null);
  const [scenario1Samples, setScenario1Samples] = useState(0);
  const [scenario2Data, setScenario2Data] = useState(null);
  const [scenario2Samples, setScenario2Samples] = useState(0);

  const handleScenario1Data = (data, samples) => {
    setScenario1Data(data);
    setScenario1Samples(samples);
    localStorage.setItem('scenario1Data', JSON.stringify(data));
  };

  const handleScenario2Data = (data, samples) => {
    setScenario2Data(data);
    setScenario2Samples(samples);
    localStorage.setItem('scenario2Data', JSON.stringify(data));
  };

  const handleSerialData = (scenarioId, data) => {
    if (scenarioId === '1') {
      handleScenario1Data(data, data.length);
    } else {
      handleScenario2Data(data, data.length);
    }
  };

  return (
    <div>
      <Header 
        title="IoT Predictive Maintenance Analysis Platform"
        subtitle="Data Handling and Processing"
        titleIcon="bi-gear"
        subtitleIcon="bi-upload"
      />
      
      <div className="container-flex">
        {/* Scenario 1 */}
        <div className="scenario">
          <h3>
            <i className="bi bi-database" style={{ color: '#28a745' }}></i> 
            Scenario 1: Raw Data
          </h3>
          
          <SerialConnection
            scenarioId="1"
            onDataReceived={(data) => handleSerialData('1', data)}
          />
          
          <DataUpload
            scenarioId="1"
            isGoertzel={false}
            onDataProcessed={handleScenario1Data}
          />
          
          <DataPreview
            data={scenario1Data}
            isGoertzel={false}
            totalSamples={scenario1Samples}
            isVisible={scenario1Data !== null}
          />
        </div>

        {/* Scenario 2 */}
        <div className="scenario">
          <h3>
            <i className="bi bi-bar-chart" style={{ color: '#dc3545' }}></i> 
            Scenario 2: Goertzel Algorithm results
          </h3>
          
          <SerialConnection
            scenarioId="2"
            onDataReceived={(data) => handleSerialData('2', data)}
          />
          
          <DataUpload
            scenarioId="2"
            isGoertzel={true}
            onDataProcessed={handleScenario2Data}
          />
          
          <DataPreview
            data={scenario2Data}
            isGoertzel={true}
            totalSamples={scenario2Samples}
            isVisible={scenario2Data !== null}
          />
        </div>
      </div>
    </div>
  );
};

export default DataProcessing;