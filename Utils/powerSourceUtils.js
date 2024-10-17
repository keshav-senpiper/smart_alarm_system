// utils/powerSourceUtils.js
const PowerSourceUsage = require('../models/PowerSourceUsage');

async function updatePowerSourceUsage(deviceId, lastPowerSource, lastTimestamp, currentTimestamp, phase1Voltage, phase3Voltage, timeDifference) {
  let newPowerSource = null;

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
            device_id: deviceId,
            power_source: lastPowerSource,
            end_time: null, // Only update records with no end_time
          },
        }
      );
    }

    // Create a new battery record from lastTimestamp to currentTimestamp
    if (lastTimestamp) {
      await PowerSourceUsage.create({
        device_id: deviceId,
        power_source: newPowerSource,
        start_time: lastTimestamp,
        end_time: currentTimestamp,
      });
    }
  } else if (phase1Voltage === 0 && phase3Voltage !== 0) {
    // Case 2: DG usage
    newPowerSource = 'DG';
  } else if (phase1Voltage !== 0 && phase3Voltage !== 0) {
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
            device_id: deviceId,
            power_source: lastPowerSource,
            end_time: null, // Only update records with no end_time
          },
        }
      );
    }

    // Start a new power source usage record if not Battery (Battery already recorded above)
    if (newPowerSource !== 'Battery') {
      await PowerSourceUsage.create({
        device_id: deviceId,
        power_source: newPowerSource,
        start_time: currentTimestamp,
        end_time: null, // The end_time is not known yet
      });
    }
  }

  // Return the new power source for further use
  return newPowerSource;
}

module.exports = {
  updatePowerSourceUsage,
};
