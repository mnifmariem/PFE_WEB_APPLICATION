// src/services/dataService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3009/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

export const processFileData = async (fileContent, isGoertzel) => {
  const endpoint = isGoertzel ? '/data/process-goertzel' : '/data/process-raw';
  
  const response = await api.post(endpoint, {
    data: fileContent,
    type: 'string'
  });

  console.log('data',response.data);
  
  return response.data;
};

export const getAvailablePorts = async () => {
  const response = await api.get('/serial/ports');
  return response.data.ports;
};

export const connectToPort = async (comPort, baudRate) => {
  const response = await api.post('/serial/connect', {
    comPort,
    baudRate
  });
  return response.data;
};

export const disconnectFromPort = async () => {
  const response = await api.post('/serial/disconnect');
  return response.data;
};