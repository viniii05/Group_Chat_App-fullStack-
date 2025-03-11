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
        Message.belongsTo(models.UserDatum, { foreignKey: "userId" });
    };

    return Message;
};
