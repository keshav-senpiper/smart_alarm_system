const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeterV2Reading = sequelize.define('MeterV2Reading',{
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  protocol: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  firmwareVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signalStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  datetime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  flags: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  relayStatus: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  btsVoltage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  temp: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainRV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainYV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainBV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainRC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainYC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainBC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mainFQ: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgRV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgYV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgBV: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgRC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgYC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgBC: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dgFQ: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'meterV2_readings',
  tableName: 'meterV2_readings',
  timestamps: false,
});

module.exports = MeterV2Reading;
