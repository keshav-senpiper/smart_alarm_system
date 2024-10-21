// models/PowerSourceUsage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PowerSourceUsage = sequelize.define('PowerSourceUsage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  power_source: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Battery', 'DG', 'Mains']],
    },
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true, // Can be null if the usage is ongoing
  },
  remark:{
    type: DataTypes.STRING,
    allowNull:true,
    defaultValue:"NA"
  }
}, {
  tableName: 'PowerSourceUsage',
  timestamps: true, // Adds created_at and updated_at fields
});

module.exports = PowerSourceUsage;
