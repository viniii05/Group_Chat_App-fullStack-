const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require('./UserData');

const ChatMessage = sequelize.define("ChatMessage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

ChatMessage.belongsTo(User, { foreignKey: "userId" });

module.exports = ChatMessage;