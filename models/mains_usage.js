// models/MainsUsage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MainsUsage = sequelize.define('MainsUsage', {
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
  tableName: 'mains_usage',
  timestamps: false,
});

module.exports = MainsUsage;
