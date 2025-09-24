// src/components/Scenario.jsx
import { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { createWebSocket } from '../utils/websocket';

function Scenario({ prefix, isGoertzel, ports, title, icon, iconColor }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileInfo, setFileInfo] = useState('');
  const [totalSamples, setTotalSamples] = useState(0);
  const [data, setData] = useState([]);
  const [showRealTime, setShowRealTime] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const comRef = useRef(null);
  const baudRef = useRef(null);
  const outRef = useRef(null);
  const titleRef = useRef(null);
  const uploadRef = useRef(null);
  const fileInfoRef = useRef(null);
  const successRef = useRef(null);
  const errorRef = useRef(null);
  const totalSamplesRef = useRef(null);

  useEffect(() => {
    // Setup WebSocket in setup
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const setupWebSocket = () => {
    ws.current = createWebSocket(handleMessage, () => setConnected(false));
  };

  const handleMessage = (e) => {
    const msg = JSON.parse(e.data);
    if ((isGoertzel && msg.type === 'goertzel') || (!isGoertzel && msg.type === 'raw')) {
      displayData(msg.data);
      localStorage.setItem(`scenario${prefix}Data`, JSON.stringify(msg.data));
      if (ws.current) ws.current.close();
    } else if (msg.error) {
      setError(msg.error);
    } else if (msg.status) {
      setConnected(msg.status.includes('Connected'));
    }
  };

  const connect = () => {
    const com = comRef.current.value;
    const baud = Number(baudRef.current.value);
    if (!com || !baud) {
      alert('Select COM and Baud.');
      return;
    }
    setupWebSocket();
    ws.current.send(JSON.stringify({ command: 'connect', comPort: com, baudRate: baud }));
    setConnected(true);
  };

  const disconnect = () => {
    if (ws.current) ws.current.send(JSON.stringify({ command: 'disconnect' }));
    clearSection();
  };

  const displayData = (data) => {
    titleRef.current.style.display = 'block';
    let html = '';
    if (isGoertzel) {
      html = `
        <table>
          <thead>
            <tr><th>Freq (Hz)</th><th>Coeff</th><th>Q0</th><th>Q1</th><th>Q2</th></tr>
          </thead>
          <tbody>
            ${data.map(r => `<tr><td>${r.freq || 'N/A'}</td><td>${r.c !== undefined ? r.c : 'N/A'}</td><td>${r.q0 || 'N/A'}</td><td>${r.q1 || 'N/A'}</td><td>${r.q2 || 'N/A'}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    } else {
      const rawData = typeof data === 'string' ? data : JSON.stringify(data);
      html = `<pre>${rawData}</pre>`;
      if (prefix === '1') {
        const lines = rawData.trim().split(/[\r\n]+/).filter(line => line.trim().length > 0);
        let totalValues = lines.length === 1 ? lines[0].split(',').filter(val => val.trim().length > 0).length : lines.length;
        setTotalSamples(totalValues);
        totalSamplesRef.current.style.display = 'block';
      }
    }
    outRef.current.innerHTML = html;
    setData(data);
  };

  const clearSection = () => {
    outRef.current.innerHTML = '';
    titleRef.current.style.display = 'none';
    setFileInfo('');
    setSuccess('');
    setError('');
    totalSamplesRef.current.style.display = 'none';
    setTotalSamples(0);
    setData([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    uploadRef.current.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    // Your full processFile logic here, using setState for updates
    // ... (copy from original, adapt to setState)
  };

  return (
    <div className="scenario">
      <h3><i className={`bi ${icon}`} style={{ color: iconColor }}></i> {title}</h3>
      <div className="collapsible-header" onClick={() => setShowRealTime(!showRealTime)}>
        <i className="bi bi-clock-history" style={{color: '#17a2b8'}}></i>
        <span className="realtime-toggle">Real-time Data Acquisition</span>
      </div>
      {showRealTime && (
        <div className="collapsible-content">
          <Form.Select ref={comRef} className="mb-2">
            <option value="">COM Port</option>
            {ports.map(p => <option key={p} value={p}>{p}</option>)}
          </Form.Select>
          <Form.Select ref={baudRef} className="mb-2">
            <option value="">Baud Rate</option>
            <option>9600</option>
            <option>115200</option>
          </Form.Select>
          <Button onClick={connect} variant="primary" className="me-2 mb-2" disabled={connected}>Connect</Button>
          <Button onClick={disconnect} variant="secondary" className="mb-2" disabled={!connected}>Disconnect</Button>
          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      )}
      <div className="upload-section">
        <div className="collapsible-header" onClick={() => setShowUpload(!showUpload)}>
          <i className="bi bi-cloud-upload" style={{color: '#ffc107'}}></i>
          <span className="upload-title">Data Upload & Processing</span>
        </div>
        {showUpload && (
          <div ref={uploadRef} className="upload-area" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
            <i className="bi bi-cloud-upload" style={{color: '#ffc107', fontSize: '2rem'}}></i> Drag and drop file here<br />
            Limit 200MB per file - CSV, TSV, TXT
            <Button variant="outline-warning" className="mt-2" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,.tsv,.txt';
              input.onchange = (e) => processFile(e.target.files[0]);
              input.click();
            }}>Browse files</Button>
            <div className="file-info">{fileInfo}</div>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
          </div>
        )}
      </div>
      <div ref={titleRef} className="data-preview-title" style={{display: 'none'}}><i className="bi bi-table" style={{color: '#0d6efd'}}></i> Data Preview</div>
      <div ref={outRef} className="output-box"></div>
      <div ref={totalSamplesRef} className="total-samples" style={{display: 'none'}}>Total Samples: {totalSamples}</div>
    </div>
  );
}

export default Scenario;