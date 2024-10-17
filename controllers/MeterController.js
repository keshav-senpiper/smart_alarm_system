const MeterReading = require('../models/MeterReading');
const PowerSourceUsage = require('../models/PowerSourceUsage');
const { Op } = require('sequelize');


exports.createReading = async (req, res) => {
  const { DevId, DevType, phases } = req.body;
  const currentPacketTime = new Date();

  try {
    // Fetch the latest entry from MeterReading
    const lastReading = await MeterReading.findOne({
      where: { device_id: DevId },
      order: [['timestamp', 'DESC']],
    });

    let lastPacketTime = lastReading ? lastReading.timestamp : null;
    let timeDifference = lastPacketTime ? (currentPacketTime - lastPacketTime) / 1000 : 0; // in seconds

    // Determine the current power source
    let newPowerSource = null;
    if (timeDifference > 60) {
      newPowerSource = 'Battery';
      var batteryStartTime = lastPacketTime;
      var batteryEndTime = currentPacketTime;
    } else if (phases.phase1.find(p => p.param === 'v').value === 0 &&
               phases.phase3.find(p => p.param === 'v').value !== 0) {
      newPowerSource = 'DG';
    } else if (phases.phase1.find(p => p.param === 'v').value !== 0 &&
               phases.phase3.find(p => p.param === 'v').value !== 0) {
      newPowerSource = 'Mains';
    }

    // Check if the power source has changed
    if (lastReading && lastReading.power_source !== newPowerSource) {
      // End the previous power source usage
      await PowerSourceUsage.update(
        { end_time: currentPacketTime },
        { where: { device_id: DevId, end_time: null } }
      );

      // Start a new power source usage record
      await PowerSourceUsage.create({
        device_id: DevId,
        power_source: newPowerSource,
        start_time: newPowerSource === 'Battery' ? batteryStartTime : currentPacketTime,
        end_time: newPowerSource === 'Battery' ? batteryEndTime : null,
      });
    }

    // Insert the new MeterReading entry
    const newReading = await MeterReading.create({
      device_id: DevId,
      device_type: DevType,
      timestamp: currentPacketTime,
      phase1_kw: phases.phase1.find(p => p.param === 'kw').value,
      phase1_current: phases.phase1.find(p => p.param === 'i').value,
      phase1_voltage: phases.phase1.find(p => p.param === 'v').value,
      phase1_pf: phases.phase1.find(p => p.param === 'pf').value,
      phase2_kw: phases.phase2.find(p => p.param === 'kw').value,
      phase2_current: phases.phase2.find(p => p.param === 'i').value,
      phase2_voltage: phases.phase2.find(p => p.param === 'v').value,
      phase2_pf: phases.phase2.find(p => p.param === 'pf').value,
      phase3_kw: phases.phase3.find(p => p.param === 'kw').value,
      phase3_current: phases.phase3.find(p => p.param === 'i').value,
      phase3_voltage: phases.phase3.find(p => p.param === 'v').value,
      phase3_pf: phases.phase3.find(p => p.param === 'pf').value,
      others_f: phases.others.find(p => p.param === 'F').value,
      others_apf: phases.others.find(p => p.param === 'Apf').value,
      others_tkw: phases.others.find(p => p.param === 'Tkw').value,
      avg_current: (phases.phase1.find(p => p.param === 'i').value +
                    phases.phase2.find(p => p.param === 'i').value +
                    phases.phase3.find(p => p.param === 'i').value) / 3,
      avg_voltage: (phases.phase1.find(p => p.param === 'v').value +
                    phases.phase2.find(p => p.param === 'v').value +
                    phases.phase3.find(p => p.param === 'v').value) / 3,
    });

    res.status(201).json(newReading);
  } catch (error) {
    console.error('Error creating meter reading:', error);
    res.status(500).json({ error: 'An error occurred while creating the meter reading.' });
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

