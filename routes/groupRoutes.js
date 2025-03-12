const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authenticateUser");

const router = express.Router();

router.get("/", authMiddleware.authenticateUser, groupController.getUserGroups);
router.post("/", authMiddleware.authenticateUser, groupController.createGroup);
router.post("/invite", authMiddleware.authenticateUser, groupController.inviteUser);
router.get("/user/:userId", authMiddleware.authenticateUser, groupController.getUserGroupsById);
router.post("/make-admin", authMiddleware.authenticateUser, groupController.makeAdmin);
router.post("/remove-user", authMiddleware.authenticateUser, groupController.removeUser);
router.get("/members/:groupId", authMiddleware.authenticateUser, groupController.getGroupMembers);

module.exports = router;
