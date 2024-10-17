const MeterReading = require('../models/MeterReading');
const PowerSourceUsage = require('../models/PowerSourceUsage');
const { Op } = require('sequelize');
const { updatePowerSourceUsage } = require('../utils/powerSourceUtils');


exports.createReading = async (req, res) => {
  const { DevId, phases } = req.body;

  try {
    const lastReading = await MeterReading.findOne({
      where: { device_id: DevId },
      order: [['timestamp', 'DESC']],
    });

    const currentTimestamp = new Date();
    const lastTimestamp = lastReading ? new Date(lastReading.timestamp) : null;
    const timeDifference = lastTimestamp ? (currentTimestamp - lastTimestamp) / 1000 : 0;

    const phase1Voltage = phases.phase1.find(p => p.param === 'v').value;
    const phase3Voltage = phases.phase3.find(p => p.param === 'v').value;

    let lastPowerSource = lastReading ? await PowerSourceUsage.findOne({
      where: {
        device_id: DevId,
        end_time: null,
      },
    }).then(entry => entry ? entry.power_source : null) : null;

    lastPowerSource = await updatePowerSourceUsage(
      DevId,
      lastPowerSource,
      lastTimestamp,
      currentTimestamp,
      phase1Voltage,
      phase3Voltage,
      timeDifference
    );

    // Save the new meter reading
    await MeterReading.create({
      device_id: DevId,
      timestamp: currentTimestamp,
      // Additional fields as required
    });

    res.status(201).json({ message: 'Meter reading created successfully.' });
  } catch (error) {
    console.error('Error creating meter reading:', error);
    res.status(500).json({ error: 'An error occurred while creating meter reading.' });
  }
};

exports.getReadings = async (req, res) => {
  try {
    const { device_id, start_date, end_date, phase, param } = req.body;

    // Validation for mandatory fields
    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required.' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Both start_date and end_date are required.' });
    }

    const whereConditions = {
      device_id: device_id,
      timestamp: {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      },
    };

    let attributes = ['device_id', 'timestamp'];

    // Handling multiple phases and params
    if (!phase || phase.length === 0) {
      // No phase selected
      if (param && param.length > 0) {
        // Multiple params selected, include all phases for each param
        param.forEach((p) => {
          attributes.push(`phase1_${p}`, `phase2_${p}`, `phase3_${p}`);
        });
      } else {
        // No params selected, include avg_current and avg_voltage
        attributes.push('avg_current', 'avg_voltage');
      }
    } else {
      // Phases are selected
      phase.forEach((ph) => {
        if (ph === 'others') {
          // Include specific fields for 'others'
          attributes.push('others_f', 'others_apf', 'others_tkw');
        } else if (param && param.length > 0) {
          // Multiple params selected for the specified phases
          param.forEach((p) => {
            attributes.push(`${ph}_${p}`);
          });
        } else {
          // No specific param selected, include all default values for the phase
          attributes.push(`${ph}_kw`, `${ph}_current`, `${ph}_voltage`, `${ph}_pf`);
        }
      });
    }

    // Fetch readings from the database
    const readings = await MeterReading.findAll({
      where: whereConditions,
      attributes,
    });

    res.status(200).json(readings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the smart meter readings.' });
  }
};

