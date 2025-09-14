const serialPortService = require('../services/serialPortService');
const EventEmitter = require('events');

const socketHandler = (wss) => {
  const eventEmitter = new EventEmitter();
  serialPortService.setEventEmitter(eventEmitter);

  // Broadcast helper function
  function broadcast(data) {
    console.log('Broadcasting to clients:', data);
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data));
      }
    });
  }

  // Setup event listeners
  eventEmitter.on('goertzelData', (data) => {
    broadcast(data);
  });

  eventEmitter.on('rawData', (data) => {
    broadcast(data);
  });

  eventEmitter.on('serialError', (error) => {
    broadcast({ error: error.error });
  });

  eventEmitter.on('connectionStatus', (status) => {
    broadcast({ status: status.message });
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('message', async (message) => {
      console.log('Received from client:', message.toString());
      try {
        const msg = JSON.parse(message);

        if (msg.command === 'connect') {
          const result = await serialPortService.connectPort(msg.comPort, msg.baudRate);
          eventEmitter.emit('connectionStatus', result);
        } else if (msg.command === 'disconnect') {
          const result = await serialPortService.disconnectPort();
          eventEmitter.emit('connectionStatus', result);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        ws.send(JSON.stringify({ error: 'Error processing message: ' + err.message }));
      }
    });

    ws.on('close', async () => {
      console.log('Client disconnected');
      try {
        await serialPortService.disconnectPort();
      } catch (err) {
        console.error('Error disconnecting on client close:', err);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });
};

module.exports = socketHandler;