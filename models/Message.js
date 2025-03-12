const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");  // ✅ Make sure path is correct
const User = require("./User");

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, { foreignKey: "userId" });
    };

    return Message;
};
