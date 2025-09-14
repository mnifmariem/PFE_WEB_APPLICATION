// backend/server.js
const app = require('./src/app');
const WebSocket = require('ws');
const http = require('http');
const socketHandler = require('./src/websocket/socketHandler');

const PORT = process.env.PORT || 3009;
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server });
socketHandler(wss);

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});