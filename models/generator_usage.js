// models/GeneratorUsage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeneratorUsage = sequelize.define('GeneratorUsage', {
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
  energy_consumed: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'generator_usage',
  timestamps: false,
});

module.exports = GeneratorUsage;
