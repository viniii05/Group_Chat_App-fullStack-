const ChatMessage = require('../models/chatMessage');
const User = require('../models/UserData');

exports.saveMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const newMessage = await ChatMessage.create({ userId, message });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
};

exports.getMessages = async (req, res) => {
    try {
      const messages = await ChatMessage.findAll({
        include: [{ model: User, as: "UserDatum", attributes: ["name"] }],
        order: [["createdAt", "ASC"]],
      });
  
      if (!messages) {
        return res.status(404).json({ error: "No messages found" });
      }
  
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  };
  