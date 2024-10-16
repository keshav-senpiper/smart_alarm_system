// controllers/usageController.js
const GeneratorUsage = require('../models/generator_usage');
const MainsUsage = require('../models/mains_usage');
const BatteryUsage = require('../models/battery_usage');

exports.getAllUsageData = async (req, res) => {
  const { device_id } = req.body; // Change from req.query to req.body

  if (!device_id) {
    return res.status(400).json({ error: 'Device ID is required.' });
  }

  try {
    // Fetch data from all three tables filtered by device_id
    const generatorUsageData = await GeneratorUsage.findAll({ where: { device_id } });
    const mainsUsageData = await MainsUsage.findAll({ where: { device_id } });
    const batteryUsageData = await BatteryUsage.findAll({ where: { device_id } });

    // Combine the data in a structured response
    const response = {
      generator_usage: generatorUsageData,
      mains_usage: mainsUsageData,
      battery_usage: batteryUsageData,
    };

    // Send the combined data as a JSON response
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.status(500).json({ error: 'An error occurred while fetching the usage data.' });
  }
};

// Controller for posting data to the GeneratorUsage table
exports.postGeneratorUsage = async (req, res) => {
    const { device_id, start_time, end_time, hours, energy_consumed } = req.body;
  
    if (!device_id || !start_time || !end_time || !hours || !energy_consumed) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    try {
      const newEntry = await GeneratorUsage.create({
        device_id,
        start_time,
        end_time,
        hours,
        energy_consumed,
      });
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error posting to GeneratorUsage:', error);
      res.status(500).json({ error: 'An error occurred while posting to GeneratorUsage.' });
    }
  };
  
  // Controller for posting data to the MainsUsage table
  exports.postMainsUsage = async (req, res) => {
    const { device_id, start_time, end_time, hours, energy_consumed } = req.body;
  
    if (!device_id || !start_time || !end_time || !hours || !energy_consumed) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    try {
      const newEntry = await MainsUsage.create({
        device_id,
        start_time,
        end_time,
        hours,
        energy_consumed,
      });
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error posting to MainsUsage:', error);
      res.status(500).json({ error: 'An error occurred while posting to MainsUsage.' });
    }
  };
  
  // Controller for posting data to the BatteryUsage table
  exports.postBatteryUsage = async (req, res) => {
    const { device_id, start_time, end_time, hours } = req.body;
  
    if (!device_id || !start_time || !end_time || !hours) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    try {
      const newEntry = await BatteryUsage.create({
        device_id,
        start_time,
        end_time,
        hours,
      });
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error posting to BatteryUsage:', error);
      res.status(500).json({ error: 'An error occurred while posting to BatteryUsage.' });
    }
  };