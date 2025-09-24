// src/services/analysisService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3009/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

export const getEnergyAnalysis = async (dataSizes) => {
  const params = dataSizes ? { dataSizes: dataSizes.join(',') } : {};
  const response = await api.get('/data/energy-analysis', { params });
  return response.data.analysis;
};

export const getLatencyAnalysis = async (dataSizes) => {
  const params = dataSizes ? { dataSizes: dataSizes.join(',') } : {};
  const response = await api.get('/data/latency-analysis', { params });
  return response.data.analysis;
};