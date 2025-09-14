// backend/src/routes/data.js
const express = require('express');
const router = express.Router();
const DataController = require('../controllers/dataController');
const { validateDataProcessing } = require('../middleware/validation');

router.post('/process-raw', validateDataProcessing, DataController.processRawData);
router.post('/process-goertzel', validateDataProcessing, DataController.processGoertzelData);
router.get('/energy-analysis', DataController.getEnergyAnalysis);
router.get('/latency-analysis', DataController.getLatencyAnalysis);

module.exports = router;