// backend/src/controllers/serialController.js
const serialPortService = require('../services/serialPortService');

class SerialController {
  static async getAvailablePorts(req, res, next) {
    try {
      const ports = await serialPortService.getAvailablePorts();
      res.json({
        success: true,
        ports
      });
    } catch (error) {
      next(error);
    }
  }

  static async connectPort(req, res, next) {
    try {
      const { comPort, baudRate } = req.body;
      
      if (!comPort || !baudRate) {
        return res.status(400).json({ error: 'COM Port and Baud Rate are required' });
      }

      const result = await serialPortService.connectPort(comPort, parseInt(baudRate));
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  static async disconnectPort(req, res, next) {
    try {
      await serialPortService.disconnectPort();
      res.json({
        success: true,
        message: 'Port disconnected successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SerialController;