const MeterV2Reading = require('../models/MeterV2Reading');
const { updatePowerSourceUsageV2 } = require('../utils/powerSourceV2Utils');
const PowerSourceUsage = require('../models/PowerSourceUsage');

exports.createV2Reading = async (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Data is required.' });
  }

  const values = data.split(',').map(value => value.trim());
  if (values.length !== 23) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }
  
  try {
    const [
      protocol,
      firmwareVersion,
      device_id,
      signalStrength,
      datetime,
      flags,
      relayStatus,
      btsVoltage,
      temp,
      mainRV,
      mainYV,
      mainBV,
      mainRC,
      mainYC,
      mainBC,
      mainFQ,
      dgRV,
      dgYV,
      dgBV,
      dgRC,
      dgYC,
      dgBC,
      dgFQ
    ] = values;

    const currentTimestamp = new Date();
    const lastReading = await MeterV2Reading.findOne({
      where: { device_id: device_id },
      order: [['timestamp', 'DESC']],
    });
    
    const lastTimestamp = lastReading ? new Date(lastReading.timestamp) : null;
    const timeDifference = lastTimestamp ? (currentTimestamp - lastTimestamp) / 1000 : 0;

    let lastPowerSource = lastReading ? await PowerSourceUsage.findOne({
      where: {
        device_id: device_id,
        end_time: null,
      },
    }).then(entry => entry ? entry.power_source : null) : null;

    lastPowerSource = await updatePowerSourceUsageV2(
      device_id,
      lastPowerSource,
      lastTimestamp,
      currentTimestamp,
      mainRV,
      mainYV,
      mainBV,
      mainRC,
      mainYC,
      mainBC,
      dgRV,
      dgYV,
      dgBV,
      dgRC,
      dgYC,
      dgBC,
      timeDifference
    );

    // Save the device data
    await MeterV2Reading.create({
      timestamp: currentTimestamp,  
      protocol,
      firmwareVersion,
      device_id: device_id, 
      signalStrength,
      datetime: new Date(parseInt(datetime) * 1000), // Convert epoch to JS date
      flags,
      relayStatus,
      btsVoltage,
      temp,
      mainRV,
      mainYV,
      mainBV,
      mainRC,
      mainYC,
      mainBC,
      mainFQ,
      dgRV,
      dgYV,
      dgBV,
      dgRC,
      dgYC,
      dgBC,
      dgFQ
    });

    res.status(201).json({ message: 'Device data created successfully.' });
  } catch (error) {
    console.error('Error creating device data:', error);
    res.status(500).json({ error: 'An error occurred while creating device data.' });
  }
};
