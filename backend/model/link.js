const { DataTypes } = require("sequelize");
const sequelize = require("../database.js");

const Link = sequelize.define('Link', {
  code: { 
    type: DataTypes.STRING(8),
    primaryKey: true,
    allowNull: false,
    validate: {
      is: /^[A-Za-z0-9]{6,8}$/ 
    }
  },
  target: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  last_clicked: {
    type: DataTypes.DATE,
    allowNull: true 
  }
}, {
  tableName: 'links',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Link;
