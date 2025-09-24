// src/components/charts/ChartControls.jsx
import React from 'react';

const ChartControls = ({ 
  onDownload, 
  onFullScreen, 
  onZoomIn, 
  onZoomOut, 
  onAutoscale, 
  onZoomSelect,
  onReset,
  showZoomControls = true,
  chartInstance = null 
}) => {
  
  const handleZoomIn = () => {
    if (chartInstance && chartInstance.zoom) {
      chartInstance.zoom(1.1);
    } else if (onZoomIn) {
      onZoomIn();
    }
  };

  const handleZoomOut = () => {
    if (chartInstance && chartInstance.zoom) {
      chartInstance.zoom(0.9);
    } else if (onZoomOut) {
      onZoomOut();
    }
  };

  const handleReset = () => {
    if (chartInstance && chartInstance.resetZoom) {
      chartInstance.resetZoom();
    } else if (onReset) {
      onReset();
    }
  };

  const handleAutoscale = () => {
    if (chartInstance) {
      chartInstance.resetZoom();
      chartInstance.update('none');
    } else if (onAutoscale) {
      onAutoscale();
    }
  };

  return (
    <div className="chart-controls">
      <button onClick={onDownload} data-bs-toggle="tooltip" title="Download PNG">
        <i className="bi bi-download"></i>
      </button>
      
      {showZoomControls && (
        <>
          <button onClick={onZoomSelect} data-bs-toggle="tooltip" title="Zoom Select">
            <i className="bi bi-crop"></i>
          </button>
          <button onClick={handleZoomIn} data-bs-toggle="tooltip" title="Zoom In">
            <i className="bi bi-zoom-in"></i>
          </button>
          <button onClick={handleZoomOut} data-bs-toggle="tooltip" title="Zoom Out">
            <i className="bi bi-zoom-out"></i>
          </button>
          
          <button onClick={handleAutoscale} data-bs-toggle="tooltip" title="Autoscale">
            <i className="bi bi-fullscreen"></i>
          </button>
        </>
      )}
      
      <button onClick={onFullScreen} data-bs-toggle="tooltip" title="Full Screen">
        <i className="bi bi-arrows-fullscreen"></i>
      </button>
    </div>
  );
};

export default ChartControls;