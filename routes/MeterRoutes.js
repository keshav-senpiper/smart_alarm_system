// routes/smartMeterRoutes.js
const express = require('express');
const router = express.Router();
const MeterController = require('../controllers/MeterController');
const UsageController = require('../controllers/UsageController')

router.post('/api/all-usage', UsageController.getAllUsageData);
router.post('/api/generator',UsageController.postGeneratorUsage);
router.post('/api/mains',UsageController.postMainsUsage);
router.post('/api/battery',UsageController.postBatteryUsage);

router.post('/store-json', MeterController.createReading);
router.post('/api/smart-meter/readings', MeterController.getReadings);

// Route to get all power source usage details
router.post('/api/all-power-source-usage', UsageController.getAllPowerSourceUsage);

// Route to populate power source usage based on meter readings
router.post('/api/populate-power-source-usage', UsageController.populatePowerSourceUsage);

module.exports = router;

