// routes/smartMeterRoutes.js
const express = require('express');
const router = express.Router();
const MeterController = require('../controllers/MeterController');
const UsageController = require('../controllers/UsageController')

router.post('/api/all-usage', UsageController.getAllUsageData);
router.post('/api/generator',UsageController.postGeneratorUsage);
router.post('/api/mains',UsageController.postMainsUsage);
router.post('/api/battery',UsageController.postBatteryUsage);

router.post('/api/smart-meter', MeterController.createReading);
router.post('/api/smart-meter/readings', MeterController.getReadings);

module.exports = router;

