// backend/src/controllers/dataController.js
const dataProcessingService = require('../services/dataProcessingService');
const analysisService = require('../services/analysisService');

class DataController {
  static async processRawData(req, res, next) {
    try {
      const { data, type } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const processedData = await dataProcessingService.processRawData(data, type);
      res.json({
        success: true,
        data: processedData,
        totalSamples: processedData.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async processGoertzelData(req, res, next) {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const processedData = await dataProcessingService.processGoertzelData(data);
      res.json({
        success: true,
        data: processedData,
        shape: [processedData.length, 5]
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEnergyAnalysis(req, res, next) {
    try {
      const { dataSizes } = req.query;
      const sizes = dataSizes ? dataSizes.split(',').map(Number) : [100, 250, 480, 600, 1000];
      
      const analysis = await analysisService.calculateEnergyConsumption(sizes);
      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLatencyAnalysis(req, res, next) {
    try {
      const { dataSizes } = req.query;
      const sizes = dataSizes ? dataSizes.split(',').map(Number) : [100, 250, 480, 600, 1000];
      
      const analysis = await analysisService.calculateLatency(sizes);
      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DataController;