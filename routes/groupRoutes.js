const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authenticateUser");

const router = express.Router();

router.get("/", authMiddleware.authenticateUser, groupController.getUserGroups);
router.post("/", authMiddleware.authenticateUser, groupController.createGroup);
router.post("/invite", authMiddleware.authenticateUser, groupController.inviteUser);
router.get("/user/:userId", authMiddleware.authenticateUser, groupController.getUserGroupsById);
router.get('/:groupId/members', groupController.getGroupMembers)
router.post("/change-admin", authMiddleware.authenticateUser, groupController.changeAdminStatus);
router.post("/remove-user", authMiddleware.authenticateUser, groupController.removeUser);


module.exports = router;
