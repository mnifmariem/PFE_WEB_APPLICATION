// backend/src/routes/api.js
const express = require('express');
const router = express.Router();
const dataRoutes = require('./data');
const serialRoutes = require('./serial');

router.use('/data', dataRoutes);
router.use('/serial', serialRoutes);

module.exports = router;