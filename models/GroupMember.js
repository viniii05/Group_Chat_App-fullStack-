const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");  // ✅ Make sure path is correct
const User = require("./User");  // ✅ Load User before using it
const Group = require("./Group");  // ✅ Load Group before using it

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
            model: "users",  // ✅ Use actual table name (case-sensitive)
            key: "id",
        },
        onDelete: "CASCADE",
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "groups",  // ✅ Use actual table name (case-sensitive)
            key: "id",
        },
        onDelete: "CASCADE",
    },
    isAdmin: {   
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// ✅ Define associations after defining model
GroupMember.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
GroupMember.belongsTo(Group, { foreignKey: "groupId", onDelete: "CASCADE" });

module.exports = GroupMember;
