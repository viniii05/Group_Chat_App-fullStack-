const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group = require("./Group");
const User = require('./User');

const GroupMember = sequelize.define("GroupMember", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
});
GroupMember.associate = (models) => {
    GroupMember.belongsTo(models.Group, { foreignKey: "groupId", onDelete: "CASCADE" });
    GroupMember.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
};

module.exports = GroupMember;
