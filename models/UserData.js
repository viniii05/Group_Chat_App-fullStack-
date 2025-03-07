const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('UserData', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
        },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: false
})

module.exports = User;