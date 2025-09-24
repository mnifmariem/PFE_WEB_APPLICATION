// src/components/data/SerialConnection.jsx
import React, { useState } from 'react';
import { useSerial } from '../../hooks/useSerial';

const SerialConnection = ({ scenarioId, onDataReceived }) => {
  const [comPort, setComPort] = useState('');
  const [baudRate, setBaudRate] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const { connect, disconnect, isConnected, error, clearError } = useSerial(onDataReceived);

  const handleConnect = async () => {
    if (!comPort || !baudRate) {
      alert('Please select both COM Port and Baud Rate.');
      return;
    }
    await connect(comPort, parseInt(baudRate));
  };

  const handleDisconnect = async () => {
    await disconnect();
    clearError();
  };

  return (
    <div>
      {error && (
        <div className="error-message alert alert-danger" style={{ display: 'block' }}>
          {error}
        </div>
      )}
      <div 
        className="collapsible-header" 
        onClick={() => {
          console.log('Toggling visibility:', !isVisible);
          setIsVisible(!isVisible);
        }}
      >
        <i className="bi bi-clock-history" style={{ color: '#17a2b8' }}></i>
        <span className="realtime-toggle">Real-time Data Acquisition</span>
      </div>
      
     {isVisible && (
  <div 
    className="collapsible-content"
    style={{ 
      display: 'block',
      padding: '15px',
      border: '1px solid #ccc',
      backgroundColor: 'white'
    }}
  >
          <select 
            className="form-select mb-2"
            value={comPort}
            onChange={(e) => setComPort(e.target.value)}
          >
            <option value="">COM Port</option>
            <option value="COM6">COM6</option>
            <option value="COM7">COM7</option>
            <option value="COM8">COM8</option>
            <option value="COM9">COM9</option>
          </select>
          
          <select 
            className="form-select mb-2"
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value)}
          >
            <option value="">Baud Rate</option>
            <option value="9600">9600</option>
            <option value="115200">115200</option>
          </select>
          
          <button 
            className="btn btn-primary me-2 mb-2"
            onClick={handleConnect}
            disabled={isConnected}
          >
            Connect
          </button>
          
          <button 
            className="btn btn-secondary mb-2"
            onClick={handleDisconnect}
            disabled={!isConnected}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default SerialConnection;