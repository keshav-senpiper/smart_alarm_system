// models/MeterReading.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeterReading = sequelize.define('MeterReading', {
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  device_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phase1_kw: DataTypes.FLOAT,
  phase1_current: DataTypes.FLOAT,
  phase1_voltage: DataTypes.FLOAT,
  phase1_pf: DataTypes.FLOAT,
  phase2_kw: DataTypes.FLOAT,
  phase2_current: DataTypes.FLOAT,
  phase2_voltage: DataTypes.FLOAT,
  phase2_pf: DataTypes.FLOAT,
  phase3_kw: DataTypes.FLOAT,
  phase3_current: DataTypes.FLOAT,
  phase3_voltage: DataTypes.FLOAT,
  phase3_pf: DataTypes.FLOAT,
  others_f: DataTypes.FLOAT,
  others_apf: DataTypes.FLOAT,
  others_tkw: DataTypes.FLOAT,
  avg_current: DataTypes.FLOAT,
  avg_voltage: DataTypes.FLOAT,
}, {
  tableName: 'meter_readings',
  timestamps: false,
});

module.exports = MeterReading;
