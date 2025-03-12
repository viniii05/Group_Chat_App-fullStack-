const { User, Group, GroupMember } = require("../models");
const { Op } = require("sequelize"); // ✅ Import Sequelize operators


exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.findAll({
            include: {
                model: GroupMember,
                where: { userId },
                attributes: [],
            },
            attributes: ["id", "name"],
        });

        res.json(groups);
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
};

exports.createGroup = async (req, res) => {
    console.log("Received body:", req.body);
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) return res.status(400).json({ message: "Group name is required" });

        // Create a new group
        const group = await Group.create({ name, createdBy: userId });

        // Add the creator as the first member
        await GroupMember.create({ userId, groupId: group.id, isAdmin: true });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { groupId, searchQuery } = req.body; // Accept search query instead of just email
        if (!groupId || !searchQuery) {
            return res.status(400).json({ message: "Group ID and search query are required!" });
        }

        // Search user by email, name, or phone number
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: searchQuery },
                    { name: searchQuery },
                    { phonenumber: searchQuery }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already in the group
        const existingMember = await GroupMember.findOne({
            where: { userId: user.id, groupId }
        });

        if (existingMember) {
            return res.status(400).json({ message: "User is already a member" });
        }

        // Add user to group
        await GroupMember.create({
            userId: user.id,
            groupId,
            isAdmin: false
        });

        res.status(201).json({ message: "User invited successfully!" });
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ message: "Server error" });
    }
};



exports.changeAdminStatus = async (req, res) => {
    try {
        const { groupId, userId, makeAdmin } = req.body;
        const adminId = req.user.id;

        const adminCheck = await GroupMember.findOne({ where: { groupId, userId: adminId, isAdmin: true } });
        if (!adminCheck) return res.status(403).json({ message: "Only admins can change roles" });

        await GroupMember.update({ isAdmin: makeAdmin }, { where: { groupId, userId } });

        res.status(200).json({ message: `User ${makeAdmin ? "promoted" : "demoted"} successfully` });
    } catch (error) {
        console.error("Error updating admin status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.removeUser = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const adminId = req.user.id;

        const adminCheck = await GroupMember.findOne({ where: { groupId, userId: adminId, isAdmin: true } });
        if (!adminCheck) return res.status(403).json({ message: "Only admins can remove users" });

        await GroupMember.destroy({ where: { groupId, userId } });

        res.status(200).json({ message: "User removed successfully" });
    } catch (error) {
        console.error("Error removing user:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.makeAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const adminUserId = req.user.id;

        // Check if requester is an admin
        const adminCheck = await GroupMember.findOne({
            where: { groupId, userId: adminUserId, isAdmin: true }
        });

        if (!adminCheck) {
            return res.status(403).json({ message: "Only admins can promote members" });
        }

        // Update user role
        const member = await GroupMember.findOne({ where: { groupId, userId } });
        if (!member) return res.status(404).json({ message: "User not found in group" });

        await member.update({ isAdmin: true });

        res.json({ message: "User promoted to admin" });
    } catch (error) {
        console.error("Error making admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const groupMembers = await GroupMember.findAll({
            where: { groupId },
            include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        });

        res.json({ members: groupMembers });
    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).json({ error: "Failed to fetch group members" });
    }
};

exports.getUserGroupsById = async (req, res) => {
    try {
        const { userId } = req.params;
        const userGroups = await Group.findAll({
            include: {
                model: GroupMember,
                where: { userId },
                attributes: [],
            },
            attributes: ["id", "name"],
        });

        res.status(200).json(userGroups);
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ message: "Server error" });
    }
};
