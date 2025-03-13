const { User, Group, GroupMember, ChatMessage } = require("../models");
const upload = require('../middlewares/fileUpload');

exports.saveMessage = async (req, res) => {
  console.log("Request User:", req.user); // ✅ Debugging

  try {
    const { message, groupId } = req.body;
    const userId = req.user.id; // ✅ Ensure user ID is used

    if (!message || !groupId) {
      return res.status(400).json({ error: "Message and Group ID are required" });
    }

    // ✅ Check if user is a member of the group
    const isMember = await GroupMember.findOne({ where: { userId, groupId } });
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // ✅ Save the message with groupId
    const newMessage = await ChatMessage.create({ userId, message, groupId });

    // ✅ Fetch user's name to send correct data via WebSocket
    const user = await User.findByPk(userId, { attributes: ["name"] });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Emit message to the specific group
    const io = req.app.get("io"); // Get io instance
    if (io) {
      io.to(`group_${groupId}`).emit("receiveMessage", {
        user: user.name,
        text: message,
        groupId,
      });
    }


    // ✅ Respond to the client
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
};

// ✅ Fetch messages for a specific group
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.params; // Expecting groupId in URL

    if (!groupId) {
      return res.status(400).json({ error: "Group ID is required" });
    }

    // ✅ Fetch messages for the group
    const messages = await ChatMessage.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["name"] }],
      order: [["createdAt", "ASC"]],
    });

    if (messages.length === 0) {
      return res.status(404).json({ error: "No messages found in this group" });
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.uploadFile =  async (req, res) => {
  try {
      const fileUrl = req.file.location; // S3 file URL
      const { userId, groupId } = req.body;

      // Save the file message in the database
      await ChatMessage.create({
          message: fileUrl, // Storing file URL as message
          userId,
          groupId
      });

      res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed' });
  }
};