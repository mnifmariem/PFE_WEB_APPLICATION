// src/utils/websocket.js
export function createWebSocket(onMessage, onClose) {
  const ws = new WebSocket('ws://localhost:3009');
  ws.onopen = () => console.log('[WS] Connected');
  ws.onmessage = (e) => onMessage(e);
  ws.onclose = () => {
    console.log('[WS] Closed');
    if (onClose) onClose();
  };
  ws.onerror = (err) => console.error('[WS] Error:', err);
  return ws;
}