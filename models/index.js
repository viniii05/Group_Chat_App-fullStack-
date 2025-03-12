const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const ChatMessage = require("./ChatMessage");

User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });


User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });


User.hasMany(GroupMember, { foreignKey: "userId", onDelete: "CASCADE" }); // Ensure this exists
GroupMember.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

Group.hasMany(GroupMember, { foreignKey: "groupId", onDelete: "CASCADE" });
GroupMember.belongsTo(Group, { foreignKey: "groupId", onDelete: "CASCADE" });

Group.hasMany(ChatMessage, { foreignKey: "groupId", onDelete: "CASCADE" });
ChatMessage.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(ChatMessage, { foreignKey: "userId", onDelete: "CASCADE" });
ChatMessage.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, Sequelize, User, Group, GroupMember, ChatMessage };
