// src/components/data/DataPreview.jsx
import React from 'react';

const DataPreview = ({ data, isGoertzel, totalSamples, isVisible }) => {
  if (!isVisible || !data || data.length === 0) {
    return null;
  }

  const renderGoertzelTable = () => (
    <table>
      <thead>
        <tr>
          <th>Freq (Hz)</th>
          <th>Coeff</th>
          <th>Q0</th>
          <th>Q1</th>
          <th>Q2</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.freq || 'N/A'}</td>
            <td>{row.c !== undefined ? row.c : 'N/A'}</td>
            <td>{row.q0 || 'N/A'}</td>
            <td>{row.q1 || 'N/A'}</td>
            <td>{row.q2 || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

const renderRawData = () => {
    const displayData = Array.isArray(data) ? data.join(', ') : String(data);
    return <pre>{displayData}</pre>;
};

  return (
    <div>
      <div className="data-preview-title">
        <i className="bi bi-table" style={{ color: '#0d6efd' }}></i> Data Preview
      </div>
      
      <div className="output-box">
        {isGoertzel ? renderGoertzelTable() : renderRawData()}
      </div>
      
      {totalSamples && (
        <div className="total-samples">
          Total Samples: {totalSamples}
        </div>
      )}
    </div>
  );
};

export default DataPreview;