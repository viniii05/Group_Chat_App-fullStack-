const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Group = sequelize.define("Group", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    createdBy: {  // Track who created the group
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// ✅ Define associations inside each model
// Group.hasMany(require("./GroupMember"), { foreignKey: "groupId", onDelete: "CASCADE" });

module.exports = Group;
