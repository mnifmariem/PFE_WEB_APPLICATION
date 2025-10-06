import React, { useRef } from 'react';

const DataTable = ({ data, columns, title, onFullScreen }) => {
  const tableWrapperRef = useRef(null);

 const downloadAsCSV = () => {
  const headers = columns.map(col => `"${col.label}"`).join(',');
  const rows = data.map(row => 
    columns.map(col => `"${col.format ? col.format(row[col.key]) : row[col.key]}"`).join(',')
  );
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(title || 'energy_saving_analysis').toLowerCase().replace(/\s+/g, '_')}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      tableWrapperRef.current
        .requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Error exiting fullscreen:', err));
    }
    if (onFullScreen) onFullScreen();
  };

  return (
    <div className="table-wrapper" ref={tableWrapperRef}>
      <h4>{title}</h4>
      <div className="table-controls">
        <button onClick={downloadAsCSV} data-bs-toggle="tooltip" title="Download CSV">
          <i className="bi bi-file-earmark-arrow-down"></i>
        </button>
        <button onClick={handleFullScreen} data-bs-toggle="tooltip" title="Full Screen">
          <i className="bi bi-arrows-fullscreen"></i>
        </button>
      </div>
      <div className="table-inner">
        <table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;