const express = require("express");
const chatController = require("../controllers/chatController");
const authenticateUser = require("../middlewares/authenticateUser");
const { ChatMessage, User } = require("../models");
const upload = require('../middlewares/fileUpload');

const router = express.Router();

router.post("/chat", authenticateUser.authenticateUser, chatController.saveMessage);
router.get("/chat", authenticateUser.authenticateUser, chatController.getMessages);
router.post('/chat/upload',upload.single('file') , chatController.uploadFile);
router.get("/chat/group/:groupId", authenticateUser.authenticateUser, async (req, res) => {
    const { groupId } = req.params;
    try {
        const messages = await ChatMessage.findAll({  // ✅ Use `ChatMessage`
            where: { groupId },
            include: [{ model: User, attributes: ["name"] }],
            order: [["createdAt", "ASC"]],
        });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/archived/:groupId", chatController.archiveChats);


module.exports = router;
