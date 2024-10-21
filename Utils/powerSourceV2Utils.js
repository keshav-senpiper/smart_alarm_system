// utils/powerSourceV2Utils.js
const PowerSourceUsage = require('../models/PowerSourceUsage');

async function updatePowerSourceUsageV2(deviceId, lastPowerSource, lastTimestamp, currentTimestamp, mainRV, mainYV, mainBV, mainRC, mainYC, mainBC, dgRV, dgYV, dgBV, dgRC, dgYC, dgBC, timeDifference) {
  let newPowerSource = null;
  let remark = 'NA';

  // Convert all incoming values to numbers to avoid type mismatch
  mainRV = Number(mainRV);
  mainYV = Number(mainYV);
  mainBV = Number(mainBV);
  mainRC = Number(mainRC);
  mainYC = Number(mainYC);
  mainBC = Number(mainBC);
  dgRV = Number(dgRV);
  dgYV = Number(dgYV);
  dgBV = Number(dgBV);
  dgRC = Number(dgRC);
  dgYC = Number(dgYC);
  dgBC = Number(dgBC);

  console.log('Determining power source for device:', deviceId);

  // Determine the power source based on the conditions
  if (timeDifference > 60) {
    // Case 1: Battery usage for extended time
    newPowerSource = 'Battery';
    console.log('Detected Battery usage due to extended time difference.');

    // Close the previous power source before starting the battery record
    if (lastPowerSource) {
      try {
        const result = await PowerSourceUsage.update(
          { end_time: lastTimestamp },
          {
            where: {
              device_id: deviceId,
              power_source: lastPowerSource,
              end_time: null, // Only update records with no end_time
            },
          }
        );
        console.log('Updated previous power source:', lastPowerSource, 'with end_time:', lastTimestamp, 'Result:', result);
      } catch (error) {
        console.error('Error updating previous power source:', error);
      }
    }

    // Create a new battery record from lastTimestamp to currentTimestamp
    if (lastTimestamp) {
      try {
        await PowerSourceUsage.create({
          device_id: deviceId,
          power_source: newPowerSource,
          start_time: lastTimestamp,
          end_time: currentTimestamp,
          remark,
        });
        console.log('Created new Battery usage record from', lastTimestamp, 'to', currentTimestamp);
      } catch (error) {
        console.error('Error creating Battery usage record:', error);
      }
    }
  } else if (mainRV === 0 && mainYV === 0 && mainBV === 0 && mainRC === 0 && mainYC === 0 && mainBC === 0 &&
             dgRV === 0 && dgYV === 0 && dgBV === 0 && dgRC === 0 && dgYC === 0 && dgBC === 0) {
    // Case 2: Battery usage (all main and DG values are zero)
    newPowerSource = 'Battery';
    console.log('Detected Battery usage as all mains and DG values are zero.');
  } else if (mainRV === 0 && mainYV === 0 && mainBV === 0 && mainRC === 0 && mainYC === 0 && mainBC === 0) {
    // Case 3: DG usage (all main values are zero and at least one DG value is non-zero)
    if (dgRV !== 0 || dgYV !== 0 || dgBV !== 0 || dgRC !== 0 || dgYC !== 0 || dgBC !== 0) {
      newPowerSource = 'DG';
      console.log('Detected DG usage as all mains are zero and at least one DG value is non-zero.');
    }
  } else {
    // Case 4: Mains usage (at least one of the main values is non-zero)
    newPowerSource = 'Mains';
    console.log('Detected Mains usage as at least one mains value is non-zero.');

    // Check if DG is also in use
    if (dgRV !== 0 || dgYV !== 0 || dgBV !== 0 || dgRC !== 0 || dgYC !== 0 || dgBC !== 0) {
      remark = 'mains+dg';
      console.log('Remark updated to mains+dg as DG is also in use.');
    }
  }

  // If the power source changes, update the usage table
  if (newPowerSource && newPowerSource !== lastPowerSource) {
    // End the previous power source usage record
    if (lastPowerSource && newPowerSource !== 'Battery') {
      try {
        const result = await PowerSourceUsage.update(
          { end_time: currentTimestamp },
          {
            where: {
              device_id: deviceId,
              power_source: lastPowerSource,
              end_time: null, // Only update records with no end_time
            },
          }
        );
        console.log('Ended previous power source usage record:', lastPowerSource, 'Result:', result);
      } catch (error) {
        console.error('Error ending previous power source usage record:', error);
      }
    }

    // Start a new power source usage record if not Battery (Battery already recorded above)
    if (newPowerSource !== 'Battery') {
      try {
        await PowerSourceUsage.create({
          device_id: deviceId,
          power_source: newPowerSource,
          start_time: currentTimestamp,
          end_time: null, // The end_time is not known yet
          remark,
        });
        console.log('Created new power source usage record for', newPowerSource, 'starting at', currentTimestamp);
      } catch (error) {
        console.error('Error creating new power source usage record:', error);
      }
    }
  }

  // Return the new power source for further use
  return newPowerSource;
}

module.exports = {
  updatePowerSourceUsageV2,
};
