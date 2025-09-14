// backend/src/services/serialPortService.js
const { SerialPort } = require('serialport');

class SerialPortService {
  constructor() {
    this.port = null;
    this.eventEmitter = null;
  }

  setEventEmitter(emitter) {
    this.eventEmitter = emitter;
  }

  async getAvailablePorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        vendorId: port.vendorId,
        productId: port.productId
      }));
    } catch (error) {
      throw new Error(`Failed to list serial ports: ${error.message}`);
    }
  }

  async connectPort(comPort, baudRate) {
    try {
      if (this.port && this.port.isOpen) {
        await this.disconnectPort();
      }

      this.port = new SerialPort({
        path: comPort,
        baudRate: baudRate,
        autoOpen: false,
      });

      return new Promise((resolve, reject) => {
        this.port.open(err => {
          if (err) {
            reject(new Error(`Error opening serial port: ${err.message}`));
            return;
          }

          // Disable DTR to prevent MSP430 reset
          this.port.set({ dtr: false }, err => {
            if (err) {
              console.error('Failed to disable DTR:', err.message);
            } else {
              console.log('DTR disabled to prevent MSP430 reset');
            }
          });

          // Setup data listener
          this.port.on('data', data => {
            this.handleSerialData(data);
          });

          this.port.on('error', err => {
            console.error('Serial Port Error:', err.message);
            if (this.eventEmitter) {
              this.eventEmitter.emit('serialError', { error: err.message });
            }
          });

          resolve({
            message: `Connected to ${comPort} at ${baudRate} baud`
          });
        });
      });
    } catch (error) {
      throw new Error(`Failed to connect to serial port: ${error.message}`);
    }
  }

  async disconnectPort() {
    if (!this.port || !this.port.isOpen) {
      return { message: 'No open port to close' };
    }

    return new Promise((resolve, reject) => {
      this.port.close(err => {
        if (err) {
          reject(new Error(`Error closing serial port: ${err.message}`));
          return;
        }
        this.port = null;
        resolve({ message: 'Serial port successfully closed' });
      });
    });
  }

  handleSerialData(data) {
    const message = data.toString('utf-8').trim();
    console.log('Raw COM port data received:', JSON.stringify(message));

    const lines = message.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const parsedData = [];

    let skipHeader = true;
    lines.forEach((line, index) => {
      if (skipHeader && line.toLowerCase().includes('frequency(hz)')) {
        skipHeader = false;
        return;
      }
      if (!skipHeader) {
        const columns = line.split(/\t+/).map(col => col.trim()).filter(col => col.length > 0);
        if (columns.length >= 5) {
          const freq = Number(columns[0]);
          const c = Number(columns[1]);
          const q0 = Number(columns[2]);
          const q1 = Number(columns[3]);
          const q2 = Number(columns[4]);
          
          if (!isNaN(freq) && !isNaN(c) && !isNaN(q0) && !isNaN(q1) && !isNaN(q2)) {
            parsedData.push({ freq, c, q0, q1, q2 });
          }
        }
      }
    });

    if (this.eventEmitter) {
      if (parsedData.length > 0) {
        this.eventEmitter.emit('goertzelData', { type: 'goertzel', data: parsedData });
      } else {
        this.eventEmitter.emit('rawData', { type: 'raw', data: message });
      }
    }
  }
}

module.exports = new SerialPortService();