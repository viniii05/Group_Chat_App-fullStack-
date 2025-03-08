const express = require("express");
const chatController = require("../controllers/chatController");
const authenticateUser = require('../middlewares/authenticateUser');

const router = express.Router();

router.post("/chat", authenticateUser.authenticateUser, chatController.saveMessage);
router.get("/chat", authenticateUser.authenticateUser, chatController.getMessages);

module.exports = router;