// routes/smartMeterRoutes.js
const express = require('express');
const router = express.Router();
const MeterController = require('../controllers/MeterController');
const MeterV2Controller = require('../controllers/MeterV2Controller');
const UsageController = require('../controllers/UsageController')

router.post('/api/all-usage', UsageController.getAllUsageData);
router.post('/api/generator',UsageController.postGeneratorUsage);
router.post('/api/mains',UsageController.postMainsUsage);
router.post('/api/battery',UsageController.postBatteryUsage);

router.post('/store-jsonV1', MeterController.createReading);
router.post('/api/smart-meter/readings', MeterController.getReadings);

// Route to get all power source usage details
router.post('/api/all-power-source-usage', UsageController.getAllPowerSourceUsage);

// Route to populate power source usage based on meter readings
router.post('/api/populate-power-source-usage', UsageController.populatePowerSourceUsage);


// MeterV2
router.post('/store-json2', MeterV2Controller.createV2Reading);


// Combined Route to handle both store-json and store-json2 based on request format
router.post('/store-json', (req, res) => {
    const { data, DevId } = req.body;
  
    if (data) {
      // If data field is present, use MeterV2Controller
      return MeterV2Controller.createV2Reading(req, res);
    } else if (DevId) {
      // If DevId field is present, use MeterController
      return MeterController.createReading(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid request format.' });
    }
  });

module.exports = router;

