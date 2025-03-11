const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authenticateUser");

const router = express.Router();

router.get("/groups", authMiddleware.authenticateUser, groupController.getUserGroups);
router.post("/groups", authMiddleware.authenticateUser, groupController.createGroup);
router.post("/groups/invite", authMiddleware.authenticateUser, groupController.inviteUser);
router.get("/groups/user/:userId", authMiddleware.authenticateUser, groupController.getUserGroupsById);

module.exports = router;
