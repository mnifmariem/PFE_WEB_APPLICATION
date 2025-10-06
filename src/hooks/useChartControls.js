// src/hooks/useChartControls.js
import { useCallback } from 'react';

export const useChartControls = (chartInstance, chartRef) => {
  const downloadChart = useCallback((filename = 'chart.png') => {
    if (chartInstance?.current) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = chartInstance.current.toBase64Image();
      link.click();
    }
  }, [chartInstance]);

  const toggleFullScreen = useCallback(() => {
    console.log('Toggle full screen');
    if (chartRef?.current) {
      const element = chartRef.current.parentElement;
      if (!document.fullscreenElement) {
        element.requestFullscreen().catch(err => {
          console.error('Error entering full screen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, [chartRef]);

  const zoomIn = useCallback(() => {
    console.log('Zoom in');
    if (chartInstance?.current?.zoom) {
            console.log('Zoom innnnn');

      chartInstance.current.zoom(1.1);
    }
  }, [chartInstance]);

  const zoomOut = useCallback(() => {
    if (chartInstance?.current?.zoom) {
      chartInstance.current.zoom(0.9);
    }
  }, [chartInstance]);

  const resetZoom = useCallback(() => {
    if (chartInstance?.current?.resetZoom) {
      chartInstance.current.resetZoom();
    }
  }, [chartInstance]);

  const autoscale = useCallback(() => {
    if (chartInstance?.current) {
      chartInstance.current.resetZoom();
      chartInstance.current.update('none');
    }
  }, [chartInstance]);

  const zoomSelect = useCallback(() => {
    // Activer le mode de sélection de zoom
    if (chartInstance?.current?.options?.plugins?.zoom) {
      chartInstance.current.options.plugins.zoom.zoom.drag.enabled = true;
      chartInstance.current.update('none');
    }
  }, [chartInstance]);

  return {
    downloadChart,
    toggleFullScreen,
    zoomIn,
    zoomOut,
    resetZoom,
    autoscale,
    zoomSelect
  };
};