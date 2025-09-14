// backend/src/routes/serial.js
const express = require('express');
const router = express.Router();
const SerialController = require('../controllers/serialController');
const { validateSerialConnection } = require('../middleware/validation');

router.get('/ports', SerialController.getAvailablePorts);
router.post('/connect', validateSerialConnection, SerialController.connectPort);
router.post('/disconnect', SerialController.disconnectPort);

module.exports = router;