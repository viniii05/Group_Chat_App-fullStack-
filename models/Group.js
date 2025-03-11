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
});

Group.associate = (models) => {
    Group.hasMany(models.GroupMember, { foreignKey: "groupId", onDelete: "CASCADE" });
    Group.belongsToMany(models.User, { through: models.GroupMember, foreignKey: "groupId" });
};


module.exports = Group;
