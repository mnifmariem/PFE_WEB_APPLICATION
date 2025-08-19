const express = require('express');
const { SerialPort } = require('serialport');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Serve static files (your frontend HTML/JS/CSS)
app.use(express.static(__dirname));

const wss = new WebSocket.Server({ server });

let port = null; // Will hold the SerialPort instance

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Broadcast helper function
function broadcast(data) {
  console.log('Broadcasting to clients:', data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', ws => {
  console.log('New WebSocket client connected');

  ws.on('message', async (message) => {
    console.log('Received from client:', message.toString());
    try {
      const msg = JSON.parse(message);

      if (msg.command === 'connect') {
        if (port && port.isOpen) {
          console.log('Closing existing port before opening new one');
          await closePort();
        }
        console.log(`Attempting to open COM port: ${msg.comPort} at baud rate: ${msg.baudRate}`);
        openPort(msg.comPort, msg.baudRate);

      } else if (msg.command === 'disconnect') {
        if (port && port.isOpen) {
          console.log('Received disconnect command, closing port');
          await closePort();
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
      broadcast(JSON.stringify({ error: 'Error processing message: ' + err.message }));
    }
  });

  ws.on('close', async () => {
    console.log('Client disconnected');
    if (port && port.isOpen) {
      console.log('Closing port due to client disconnection');
      await closePort();
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

function openPort(comPort, baudRate) {
  try {
    port = new SerialPort({
      path: comPort,
      baudRate: baudRate,
      autoOpen: false,
    });

    console.log(`Initializing SerialPort with path: ${comPort}, baudRate: ${baudRate}`);

    port.open(err => {
      if (err) {
        console.error('Error opening serial port:', err.message);
        broadcast(JSON.stringify({ error: 'Error opening serial port: ' + err.message }));
        return;
      }
      console.log(`Serial port ${comPort} successfully opened at ${baudRate} baud`);
      port.set({ dtr: false }, err => {
        if (err) {
          console.error('Failed to disable DTR:', err.message);
        } else {
          console.log('DTR disabled to prevent MSP430 reset');
        }
      });
      broadcast(JSON.stringify({ status: `Connected to ${comPort} at ${baudRate} baud` }));

      // Simulate data for testing (remove in production)
      // const mockData = Buffer.from(
      //   'Frequency(Hz)\tCoefficient\tQ0\tQ1\tQ2\n662\t15217\t6993149\t6993149\t5254142\n'
      // );
      // setTimeout(() => {
      //   console.log('Emitting mock data');
      //   port.emit('data', mockData);
      // }, 1000);
    });

    port.on('data', data => {
      const message = data.toString('utf-8').trim();
      console.log('Raw COM port data received:', JSON.stringify(message));

      const lines = message.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log('Lines after splitting:', lines);
      const parsedData = [];

      let skipHeader = true;
      lines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}: ${line}`);
        if (skipHeader && line.toLowerCase().includes('frequency(hz)')) {
          console.log('Header detected, skipping...');
          skipHeader = false;
          return;
        }
        if (!skipHeader) {
          const columns = line.split(/\t+/).map(col => col.trim()).filter(col => col.length > 0);
          console.log(`Split columns: ${columns}, Count: ${columns.length}`);
          if (columns.length >= 5) {
            const freq = Number(columns[0]);
            const c = Number(columns[1]);
            const q0 = Number(columns[2]);
            const q1 = Number(columns[3]);
            const q2 = Number(columns[4]);
            console.log(`Parsed values: freq=${freq}, c=${c}, q0=${q0}, q1=${q1}, q2=${q2}`);
            if (!isNaN(freq) && !isNaN(c) && !isNaN(q0) && !isNaN(q1) && !isNaN(q2)) {
              const dataRow = { freq, c, q0, q1, q2 };
              parsedData.push(dataRow);
              console.log('Valid data added to parsedData:', dataRow);
            } else {
              console.log('Invalid number in line:', line);
            }
          } else {
            console.log('Insufficient columns in line:', line, 'Columns found:', columns.length);
          }
        }
      });

      if (parsedData.length > 0) {
        const jsonMessage = JSON.stringify({ type: 'goertzel', data: parsedData });
        console.log('Broadcasting parsed COM port data:', jsonMessage);
        broadcast(jsonMessage);
      } else {
        console.log('No valid parsed data, broadcasting raw data:', message);
        broadcast(JSON.stringify({ type: 'raw', data: message }));
      }
    });

    port.on('error', err => {
      console.error('Serial Port Error:', err.message);
      broadcast(JSON.stringify({ error: 'Serial Port Error: ' + err.message }));
    });
  } catch (err) {
    console.error('Error initializing SerialPort:', err);
    broadcast(JSON.stringify({ error: 'Error initializing SerialPort: ' + err.message }));
  }
}

function closePort() {
  return new Promise((resolve, reject) => {
    if (!port || !port.isOpen) {
      console.log('No open port to close');
      resolve();
      return;
    }
    port.close(err => {
      if (err) {
        console.error('Error closing serial port:', err.message);
        broadcast(JSON.stringify({ error: 'Error closing serial port: ' + err.message }));
        reject(err);
        return;
      }
      console.log('Serial port successfully closed');
      broadcast(JSON.stringify({ status: 'Disconnected' }));
      resolve();
    });
  });
}

const PORT = 3009;
server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server started on http://localhost:${PORT}`);
});