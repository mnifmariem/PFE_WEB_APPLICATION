// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import DataProcessing from './pages/DataProcessing';
import EnergyAnalysis from './pages/EnergyAnalysis';
import AlgorithmAnalysis from './pages/AlgorithmAnalysis';
import LatencyAnalysis from './pages/LatencyAnalysis';
import ScenarioComparison from './pages/ScenarioComparison';
import Report from './pages/Report';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DataProcessing />} />
          <Route path="/algorithms" element={<AlgorithmAnalysis />} />
          <Route path="/energy" element={<EnergyAnalysis />} />
          <Route path="/latency" element={<LatencyAnalysis />} />
          <Route path="/scenarios" element={<ScenarioComparison />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;