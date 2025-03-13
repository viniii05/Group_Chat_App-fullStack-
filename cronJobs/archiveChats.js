const cron = require("node-cron");
const { Op } = require("sequelize");
const ChatMessage = require("../models/ChatMessage");
const ArchivedChat = require("../models/ArchivedChat");

// Schedule job to run every night at 12:00 AM
cron.schedule("0 0 * * *", async () => {
    console.log("Running chat archive cron job...");

    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Fetch messages older than 1 day
        const oldMessages = await ChatMessage.findAll({
            where: {
                createdAt: { [Op.lt]: oneDayAgo }
            }
        });

        if (oldMessages.length > 0) {
            // Move to ArchivedChats table
            await ArchivedChat.bulkCreate(
                oldMessages.map(msg => ({
                    message: msg.message,
                    userId: msg.userId,
                    groupId: msg.groupId,
                    createdAt: msg.createdAt
                }))
            );

            // Delete old messages from ChatMessages table
            await ChatMessage.destroy({
                where: {
                    createdAt: { [Op.lt]: oneDayAgo }
                }
            });

            console.log(`Archived and deleted ${oldMessages.length} messages.`);
        } else {
            console.log("No messages to archive.");
        }
    } catch (error) {
        console.error("Error archiving chats:", error);
    }
});
