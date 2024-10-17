// models/BatteryUsage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BatteryUsage = sequelize.define('BatteryUsage', {
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
      },  
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'battery_usage',
  timestamps: false,
});

module.exports = BatteryUsage;
