import React, { useState } from 'react';
import Header from '../components/common/Header';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Report = () => {
  const [reportGenerated, setReportGenerated] = useState(false);

  // Function to format the current date and time
  const getFormattedDateTime = () => {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Europe/Paris' // CET timezone
    };
    return now.toLocaleString('en-US', options);
  };

  // Generate report content
  const generateReport = () => {
    setReportGenerated(true);
  };

  // Download report as PDF
  const downloadReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const currentDateTime = getFormattedDateTime();

    // Add header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('IoT Predictive Maintenance Analysis Report', 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${currentDateTime}`, 20, 28);

    // Project Overview
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Overview', 20, 38);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Project Title: Efficient Data Processing for Predictive Maintenance in IoT Systems', 20, 46, { maxWidth: 170 });
    doc.text('Objective: Compare two scenarios for IoT predictive maintenance:', 20, 54, { maxWidth: 170 });
    doc.text('Scenario 1: Raw data transmission from sensor node to edge device', 20, 60, { maxWidth: 170 });
    doc.text('Scenario 2: Edge processing with Goertzel algorithm on sensor node', 20, 64, { maxWidth: 170 });
    doc.text('Key Benefits of Scenario 2:', 20, 70, { maxWidth: 170 });
    doc.text('- Reduced energy consumption', 20, 76, { maxWidth: 170 });
    doc.text('- Lower latency', 20, 80, { maxWidth: 170 });
    doc.text('- Decreased network bandwidth requirements', 20, 84, { maxWidth: 170 });
    doc.text('- Maintained accuracy while processing on resource-constrained devices', 20, 88, { maxWidth: 170 });

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 96);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This report evaluates the efficiency of two IoT predictive maintenance scenarios, focusing on algorithm performance (FFT vs Goertzel), energy consumption, latency, and compression. Scenario 2 (Goertzel) demonstrates superior efficiency, particularly for larger datasets, as outlined in the project overview.', 20, 104, { maxWidth: 170 });

    // FFT vs Goertzel Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FFT vs Goertzel Analysis', 20, 122);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('The Fast Fourier Transform (FFT) computes the full frequency spectrum, while the Goertzel algorithm targets specific frequencies, making it more efficient for sparse spectrum analysis in IoT applications.', 20, 130, { maxWidth: 170 });
    autoTable(doc, {
      startY: 142,
      head: [['Algorithm', 'Computational Complexity', 'Use Case']],
      body: [
        ['FFT', 'O(N log N)', 'Broad-spectrum frequency analysis; Applications requiring full frequency spectrum (e.g., audio processing, radar); Suitable for small datasets or systems with ample computational resources'],
        ['Goertzel', 'O(N)', 'Targeted frequency detection (e.g., specific vibration frequencies in machinery); IoT devices with constrained resources (memory, power); Scenarios requiring minimal data transmission']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' }, 2: { cellWidth: 80 } }
    });

    // Energy Consumption
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Energy Consumption Analysis', 20, doc.lastAutoTable.finalY + 20);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 26,
      head: [['Data Size', 'Scenario 1 (mJ)', 'Scenario 2 (mJ)', 'Savings (mJ)', 'Savings (%)']],
      body: [
        ['100', '8.432024', '3.7971663', '4.6348577', '54.9'],
        ['250', '19.249107', '5.570224', '13.678883', '71.1'],
        ['480', '38.213902', '8.583681', '29.630221', '77.5'],
        ['600', '46.186567', '9.261920', '36.924647', '79.9'],
        ['1000', '78.265910', '14.412746', '63.853164', '81.6']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' } }
    });

    // Latency Analysis
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Latency Analysis', 20, 20);
    autoTable(doc, {
      startY: 26,
      head: [['Data Size', 'Scenario 1 (ms)', 'Scenario 2 (ms)', 'Reduction (%)']],
      body: [
        ['100', '277.8', '184.21', '33.7'],
        ['250', '606.4', '363.51', '40.0'],
        ['480', '1126', '659.11', '41.5'],
        ['600', '1435', '808.71', '43.6'],
        ['1000', '2369', '1360.21', '42.6']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' } }
    });

    // Compression Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Compression Analysis', 20, doc.lastAutoTable.finalY + 20);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 26,
      head: [['Data Size', 'Scenario 1 (bytes)', 'Scenario 2 (bytes)', 'Reduction (%)', 'Compression Ratio']],
      body: [
        ['100', '203', '72', '64.53', '2.82'],
        ['250', '506', '72', '85.77', '7.03'],
        ['480', '971', '72', '92.56', '13.49'],
        ['600', '1214', '72', '94.07', '16.86'],
        ['1000', '2023', '72', '96.44', '28.10']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left' } }
    });

    // Key Insights
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Insights and Recommendations', 20, doc.lastAutoTable.finalY + 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const insights = [
      'Algorithm Efficiency: Goertzel\'s O(N) complexity is more efficient than FFT\'s O(N log N) for targeted frequency analysis in IoT applications, ideal for constrained devices.',
      'Superior Performance of Scenario 2: Scenario 2 (Goertzel) outperforms Scenario 1 (Raw Data) in energy, latency, and compression, aligning with project objectives.',
      'Energy Efficiency: Savings range from 54.9% to 81.6%, with 63.85 mJ saved at 1000 samples.',
      'Latency Reduction: Reductions range from 33.7% to 43.6%, with a maximum of 1008.79 ms at 1000 samples.',
      'Compression Efficiency: Up to 96.4% reduction with a 28:1 compression ratio at 1000 samples, reducing bandwidth needs.',
      'Recommendation: Use Scenario 2 with Goertzel for datasets exceeding 250 samples to optimize energy, latency, compression, and computational efficiency in IoT predictive maintenance.'
    ];
    insights.forEach((insight, index) => {
      doc.text(insight, 20, doc.lastAutoTable.finalY + 26 + (index * 8), { maxWidth: 160 });
    });

    doc.save('IoT_Predictive_Maintenance_Report.pdf');
  };

  return (
    <div>
      <Header 
        title="IoT Predictive Maintenance Analysis Platform" 
        subtitle="Comprehensive Analysis Report"
        titleIcon="bi-gear"
        subtitleIcon="bi-clipboard-data"
      />
      
      <div className="report-container">
        <div className="report-title-section">
          <button 
            className="btn btn-primary generate-report-btn" 
            onClick={generateReport}
          >
            <i className="bi bi-arrow-repeat"></i> Generate Complete Report
          </button>
        </div>

        {reportGenerated && (
          <div className="report-section">
            <div className="report-content">
              <p><strong>Generated on:</strong> {getFormattedDateTime()}</p>
              
              <h3>Project Overview</h3>
              <p><strong>Project Title:</strong> Efficient Data Processing for Predictive Maintenance in IoT Systems</p>
              <p><strong>Objective:</strong> Compare two scenarios for IoT predictive maintenance:</p>
              <div className="project-details">
                <p>Scenario 1: Raw data transmission from sensor node to edge device</p>
                <p>Scenario 2: Edge processing with Goertzel algorithm on sensor node</p>
              </div>
              <p><strong>Key Benefits of Scenario 2:</strong></p>
              <div className="project-benefits">
                <p>- Reduced energy consumption</p>
                <p>- Lower latency</p>
                <p>- Decreased network bandwidth requirements</p>
                <p>- Maintained accuracy while processing on resource-constrained devices</p>
              </div>

              <div className="summary-section">
                <h3>Summary</h3>
                <p>This report evaluates the efficiency of two IoT predictive maintenance scenarios, focusing on algorithm performance (FFT vs Goertzel), energy consumption, latency, and compression. Scenario 2 (Goertzel) demonstrates superior efficiency, particularly for larger datasets, as outlined in the project overview.</p>
              </div>

              <h3>FFT vs Goertzel Analysis</h3>
              <p>The Fast Fourier Transform (FFT) computes the full frequency spectrum, while the Goertzel algorithm targets specific frequencies, making it more efficient for sparse spectrum analysis in IoT applications.</p>
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Computational Complexity</th>
                    <th>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>FFT</td>
                    <td>O(N log N)</td>
                    <td>Broad-spectrum frequency analysis; Applications requiring full frequency spectrum (e.g., audio processing, radar); Suitable for small datasets or systems with ample computational resources</td>
                  </tr>
                  <tr>
                    <td>Goertzel</td>
                    <td>O(N)</td>
                    <td>Targeted frequency detection (e.g., specific vibration frequencies in machinery); IoT devices with constrained resources (memory, power); Scenarios requiring minimal data transmission</td>
                  </tr>
                </tbody>
              </table>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>FFT Complexity</h4>
                  <p className="value" style={{color: '#2563eb'}}>O(N log N)</p>
                  <p className="desc">Suitable for broad spectrum analysis</p>
                </div>
                <div className="insight-card">
                  <h4>Goertzel Complexity</h4>
                  <p className="value" style={{color: '#16a34a'}}>O(N)</p>
                  <p className="desc">Efficient for specific frequencies</p>
                </div>
                <div className="insight-card">
                  <h4>IoT Suitability</h4>
                  <p className="value" style={{color: '#9333ea'}}>Goertzel</p>
                  <p className="desc">Lower complexity for IoT devices</p>
                </div>
              </div>

              <h3>Energy Consumption Analysis</h3>
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Data Size</th>
                    <th>Scenario 1 (Raw Data) Energy (mJ)</th>
                    <th>Scenario 2 (Goertzel) Energy (mJ)</th>
                    <th>Energy Savings (mJ)</th>
                    <th>Savings Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>100</td><td>8.432024</td><td>3.7971663</td><td>4.6348577</td><td>54.9</td></tr>
                  <tr><td>250</td><td>19.249107</td><td>5.570224</td><td>13.678883</td><td>71.1</td></tr>
                  <tr><td>480</td><td>38.213902</td><td>8.583681</td><td>29.630221</td><td>77.5</td></tr>
                  <tr><td>600</td><td>46.186567</td><td>9.261920</td><td>36.924647</td><td>79.9</td></tr>
                  <tr><td>1000</td><td>78.265910</td><td>14.412746</td><td>63.853164</td><td>81.6</td></tr>
                </tbody>
              </table>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>Max Energy Savings</h4>
                  <p className="value" style={{color: '#16a34a'}}>81.6%</p>
                  <p className="desc">At 1000 samples</p>
                </div>
                <div className="insight-card">
                  <h4>Average Savings</h4>
                  <p className="value" style={{color: '#2563eb'}}>73.0%</p>
                  <p className="desc">Across all data sizes</p>
                </div>
                <div className="insight-card">
                  <h4>Max Savings (mJ)</h4>
                  <p className="value" style={{color: '#9333ea'}}>63.85 mJ</p>
                  <p className="desc">At 1000 samples</p>
                </div>
              </div>

              <h3>Latency Analysis</h3>
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Data Size</th>
                    <th>Scenario 1 (Raw Data) Latency (ms)</th>
                    <th>Scenario 2 (Goertzel) Latency (ms)</th>
                    <th>Reduction Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>100</td><td>277.8</td><td>184.21</td><td>33.7</td></tr>
                  <tr><td>250</td><td>606.4</td><td>363.51</td><td>40.0</td></tr>
                  <tr><td>480</td><td>1126</td><td>659.11</td><td>41.5</td></tr>
                  <tr><td>600</td><td>1435</td><td>808.71</td><td>43.6</td></tr>
                  <tr><td>1000</td><td>2369</td><td>1360.21</td><td>42.6</td></tr>
                </tbody>
              </table>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>Max Latency Reduction</h4>
                  <p className="value" style={{color: '#16a34a'}}>43.6%</p>
                  <p className="desc">At 600 samples</p>
                </div>
                <div className="insight-card">
                  <h4>Average Reduction</h4>
                  <p className="value" style={{color: '#2563eb'}}>40.3%</p>
                  <p className="desc">Across all data sizes</p>
                </div>
                <div className="insight-card">
                  <h4>Max Time Saved</h4>
                  <p className="value" style={{color: '#9333ea'}}>1008.79 ms</p>
                  <p className="desc">At 1000 samples</p>
                </div>
              </div>

              <h3>Compression Analysis</h3>
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Data Size (samples)</th>
                    <th>Scenario 1 (bytes)</th>
                    <th>Scenario 2 (bytes)</th>
                    <th>Reduction (%)</th>
                    <th>Compression Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>100</td><td>203</td><td>72</td><td>64.53</td><td>2.82</td></tr>
                  <tr><td>250</td><td>506</td><td>72</td><td>85.77</td><td>7.03</td></tr>
                  <tr><td>480</td><td>971</td><td>72</td><td>92.56</td><td>13.49</td></tr>
                  <tr><td>600</td><td>1214</td><td>72</td><td>94.07</td><td>16.86</td></tr>
                  <tr><td>1000</td><td>2023</td><td>72</td><td>96.44</td><td>28.10</td></tr>
                </tbody>
              </table>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>Max Compression</h4>
                  <p className="value" style={{color: '#2563eb'}}>96.4%</p>
                  <p className="desc">At 1000 samples</p>
                </div>
                <div className="insight-card">
                  <h4>Best Ratio</h4>
                  <p className="value" style={{color: '#16a34a'}}>28.1</p>
                  <p className="desc">Scenario 1 to 2 at 1000 samples</p>
                </div>
                <div className="insight-card">
                  <h4>Constant Size</h4>
                  <p className="value" style={{color: '#9333ea'}}>72 bytes</p>
                  <p className="desc">Scenario 2 across all sizes</p>
                </div>
              </div>

              <h3>Key Insights and Recommendations</h3>
              <div className="insights-recommendations">
                <p><strong>Algorithm Efficiency:</strong> Goertzel's O(N) complexity is more efficient than FFT's O(N log N) for targeted frequency analysis in IoT applications, ideal for constrained devices.</p>
                <p><strong>Superior Performance of Scenario 2:</strong> Scenario 2 (Goertzel) outperforms Scenario 1 (Raw Data) in energy, latency, and compression, aligning with project objectives.</p>
                <p><strong>Energy Efficiency:</strong> Savings range from 54.9% to 81.6%, with 63.85 mJ saved at 1000 samples.</p>
                <p><strong>Latency Reduction:</strong> Reductions range from 33.7% to 43.6%, with a maximum of 1008.79 ms at 1000 samples.</p>
                <p><strong>Compression Efficiency:</strong> Up to 96.4% reduction with a 28:1 compression ratio at 1000 samples, reducing bandwidth needs.</p>
                <p><strong>Recommendation:</strong> Use Scenario 2 with Goertzel for datasets exceeding 250 samples to optimize energy, latency, compression, and computational efficiency in IoT predictive maintenance.</p>
              </div>

             <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
  <button 
    className="btn btn-secondary download-report-btn"
    onClick={downloadReport}
  >
    <i className="bi bi-download"></i> Download as PDF
  </button>
</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;