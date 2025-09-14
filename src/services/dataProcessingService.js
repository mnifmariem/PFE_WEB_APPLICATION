// backend/src/services/dataProcessingService.js
const fileProcessor = require('../utils/fileProcessor');

class DataProcessingService {
  static async processRawData(data, type = 'string') {
    try {
      let processedData = [];
      
      if (typeof data === 'string') {
        const lines = data.trim().split(/[\r\n]+/).filter(line => line.trim().length > 0);
        
        if (lines.length === 1) {
          // Single line with comma-separated values
          processedData = lines[0].split(',').filter(val => val.trim().length > 0).map(val => val.trim());
        } else {
          // Multiple lines
          processedData = lines.map(line => line.trim());
        }
      } else if (Array.isArray(data)) {
        processedData = data;
      }

      return processedData;
    } catch (error) {
      throw new Error(`Error processing raw data: ${error.message}`);
    }
  }

  static async processGoertzelData(data) {
    try {
      let processedRows = [];
      
      if (typeof data === 'string') {
        processedRows = fileProcessor.parseGoertzelFile(data);
      } else if (Array.isArray(data)) {
        processedRows = data.filter(row => 
          row.freq !== undefined && 
          row.c !== undefined && 
          row.q0 !== undefined && 
          row.q1 !== undefined && 
          row.q2 !== undefined
        );
      }

      return processedRows;
    } catch (error) {
      throw new Error(`Error processing Goertzel data: ${error.message}`);
    }
  }
}

module.exports = DataProcessingService;