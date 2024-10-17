// controllers/usageController.js
const GeneratorUsage = require('../models/generator_usage');
const MainsUsage = require('../models/mains_usage');
const BatteryUsage = require('../models/battery_usage');
const PowerSourceUsage = require('../models/PowerSourceUsage');
const MeterReading = require('../models/MeterReading'); 
const {Op} = require('sequelize');

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

  exports.getAllPowerSourceUsage = async (req, res) => {
    const { device_id } = req.body; // Get device_id from the request body
  
    try {
      // Fetch records from PowerSourceUsage, filtered by device_id if provided
      const whereClause = device_id ? { device_id } : {};
      const usageRecords = await PowerSourceUsage.findAll({ where: whereClause });
  
      // Calculate usage time for each record
      const result = usageRecords.map(record => {
        const usageTime = record.end_time 
          ? (new Date(record.end_time) - new Date(record.start_time)) / 1000 // Time in seconds
          : 'Ongoing'; // If end_time is null, it's still ongoing
  
        return {
          id: record.id,
          device_id: record.device_id,
          power_source: record.power_source,
          start_time: record.start_time,
          end_time: record.end_time,
          usage_time: usageTime, // Include calculated usage time
        };
      });
  
      // Send the response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching power source usage:', error);
      res.status(500).json({ error: 'An error occurred while fetching the power source usage.' });
    }
  };




// controllers/UsageController.js

exports.populatePowerSourceUsage = async (req, res) => {
  const { start_id, end_id } = req.body;

  if (!start_id || !end_id) {
    return res.status(400).json({ error: 'Start ID and End ID are required.' });
  }

  try {
    // Fetch the meter readings within the specified range
    const meterReadings = await MeterReading.findAll({
      where: {
        id: {
          [Op.between]: [start_id, end_id],
        },
      },
      order: [['timestamp', 'ASC']], // Order by timestamp to process in chronological order
    });

    if (!meterReadings.length) {
      return res.status(404).json({ error: 'No meter readings found in the specified range.' });
    }

    // Initialize the previous power source and timestamp
    let lastPowerSource = null;
    let lastTimestamp = null;

    // Iterate over the meter readings and determine the power source for each reading
    for (let i = 0; i < meterReadings.length; i++) {
      const currentReading = meterReadings[i];
      const currentTimestamp = new Date(currentReading.timestamp);
      let newPowerSource = null;

      // Determine time difference between consecutive readings
      const timeDifference = lastTimestamp ? (currentTimestamp - lastTimestamp) / 1000 : 0; // in seconds

      // Determine the power source based on the conditions
      if (timeDifference > 60) {
        // Case 1: Battery usage
        newPowerSource = 'Battery';

        // Close the previous power source before starting the battery record
        if (lastPowerSource) {
          await PowerSourceUsage.update(
            { end_time: lastTimestamp },
            {
              where: {
                device_id: currentReading.device_id,
                power_source: lastPowerSource,
                end_time: null, // Only update records with no end_time
              },
            }
          );
        }

        // Create a new battery record from lastTimestamp to currentTimestamp
        if (lastTimestamp) {
          await PowerSourceUsage.create({
            device_id: currentReading.device_id,
            power_source: newPowerSource,
            start_time: lastTimestamp,
            end_time: currentTimestamp,
          });
        }
      } else if (currentReading.phase1_voltage === 0 && currentReading.phase3_voltage !== 0) {
        // Case 2: DG usage
        newPowerSource = 'DG';
      } else if (currentReading.phase1_voltage !== 0 && currentReading.phase3_voltage !== 0) {
        // Case 3: Mains usage
        newPowerSource = 'Mains';
      }

      // If the power source changes, update the usage table
      if (newPowerSource && newPowerSource !== lastPowerSource) {
        // End the previous power source usage record
        if (lastPowerSource && newPowerSource !== 'Battery') {
          await PowerSourceUsage.update(
            { end_time: currentTimestamp },
            {
              where: {
                device_id: currentReading.device_id,
                power_source: lastPowerSource,
                end_time: null, // Only update records with no end_time
              },
            }
          );
        }

        // Start a new power source usage record if not Battery (Battery already recorded above)
        if (newPowerSource !== 'Battery') {
          await PowerSourceUsage.create({
            device_id: currentReading.device_id,
            power_source: newPowerSource,
            start_time: currentTimestamp,
            end_time: null, // The end_time is not known yet
          });
        }

        // Update lastPowerSource to the new power source
        lastPowerSource = newPowerSource;
      }

      // Update lastTimestamp to the current reading's timestamp
      lastTimestamp = currentTimestamp;
    }

    res.status(200).json({ message: 'Power source usage data updated successfully.' });
  } catch (error) {
    console.error('Error populating power source usage:', error);
    res.status(500).json({ error: 'An error occurred while populating power source usage.' });
  }
};
