const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserData");
const Group = require("./Group"); // Import Group model

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
  groupId: {  // ✅ Add groupId
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Groups", // Make sure the table name is correct
      key: "id",
    },
  },
});

ChatMessage.belongsTo(User, { foreignKey: "userId", as: "UserDatum" });
ChatMessage.belongsTo(Group, { foreignKey: "groupId", as: "Group" }); // ✅ Associate with Group

module.exports = ChatMessage;
