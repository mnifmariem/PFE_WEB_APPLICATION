// src/components/data/DataUpload.jsx
import React, { useState, useRef } from 'react';
import { processFileData } from '../../services/dataService';

const DataUpload = ({ scenarioId, isGoertzel, onDataProcessed }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const clearMessages = () => {
    setSuccess('');
    setError('');
    setFileInfo('');
  };

  const validateFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['csv', 'tsv', 'txt'];
    const maxSize = 200 * 1024 * 1024; // 200MB

    if (!validExtensions.includes(extension)) {
      throw new Error('Invalid file type. Must be .csv, .tsv, or .txt');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size exceeds 200MB limit');
    }
  };

  const processFile = async (file) => {
    try {
      console.log('Processing file:', file.name);
      setIsLoading(true);
      clearMessages();
      validateFile(file);

      setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

      const fileContent = await new Promise((resolve, reject) => {
        console.log('Reading file content');
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });

      console.log('Sending file content to backend');
      const result = await processFileData(fileContent, isGoertzel);
      
      console.log('Backend response:', result);
      setSuccess(`Data loaded successfully! Shape: (${result.data.length}, ${isGoertzel ? 5 : 1})`);
      onDataProcessed(result.data, result.totalSamples);

    } catch (err) {
      console.error('File processing error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('File dropped:', e.dataTransfer.files[0]?.name);
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file ? file.name : 'No file');
    if (file) {
      processFile(file);
    }
  };

  const handleBrowseClick = () => {
    console.log('Browse files button clicked');
    fileInputRef.current?.click();
  };

  console.log('Rendering DataUpload - isVisible:', isVisible); // Add this to track rendering

  return (
    <div className="upload-section">
      {error && (
        <div className="error-message alert alert-danger" style={{ display: 'block' }}>
          {error}
        </div>
      )}
      <div 
        className="collapsible-header" 
        onClick={() => {
          console.log('Toggling Data Upload visibility:', !isVisible);
          setIsVisible(!isVisible);
        }}
      >
        <i className="bi bi-cloud-upload" style={{ color: '#ffc107' }}></i>
        <span className="upload-title">Data Upload & Processing</span>
      </div>
      
      {isVisible && (
  <div 
    className={`upload-area ${isDragOver ? 'dragover' : ''}`}
    style={{ 
      display: 'block',
      padding: '20px',
      border: '2px dashed #ccc',
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}
    onDragOver={(e) => {
      e.preventDefault();
      setIsDragOver(true);
    }}
          onDragLeave={() => {
            console.log('Drag left');
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
        >
          <i className="bi bi-cloud-upload" style={{ color: '#ffc107', fontSize: '2rem' }}></i>
          <div>Drag and drop file here</div>
          <div>Limit 200MB per file - CSV, TSV, TXT</div>
          
          <button 
            className="btn btn-outline-warning mt-2"
            onClick={handleBrowseClick}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Browse files'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {fileInfo && (
            <div className="file-info">{fileInfo}</div>
          )}
          
          {success && (
            <div className="success-message" style={{ display: 'block' }}>
              {success}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataUpload;