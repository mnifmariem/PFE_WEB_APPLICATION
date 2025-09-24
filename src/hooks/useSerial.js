// src/hooks/useSerial.js
import { useState, useEffect, useRef } from 'react';

export const useSerial = (onDataReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const connect = async (comPort, baudRate) => {
    try {
      console.log(`Connecting to ws://localhost:3009 with COM: ${comPort}, Baud: ${baudRate}`);
      setError(null);
      const ws = new WebSocket('ws://localhost:3009');
      
      ws.onopen = () => {
        console.log('WebSocket connection opened');
        ws.send(JSON.stringify({ 
          command: 'connect', 
          comPort, 
          baudRate 
        }));
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('Server error:', data.error);
          setError(data.error);
        } else if (data.type === 'goertzel' || data.type === 'raw') {
          console.log('Data received:', data.data);
          onDataReceived(data.data);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection failed');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    }
  };

  const disconnect = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    error,
    clearError
  };
};