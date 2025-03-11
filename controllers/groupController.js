const { User, Group, GroupMember } = require("../models");

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
        const group = await Group.create({ name });

        // Add the creator as the first member
        await GroupMember.create({ userId, groupId: group.id });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { groupId, invitedUserId } = req.body;
        const userId = req.user.id;

        // Check if the user inviting is a member of the group
        const isMember = await GroupMember.findOne({ where: { userId, groupId } });
        if (!isMember) return res.status(403).json({ message: "You are not a member of this group" });

        // Check if the invited user is already in the group
        const alreadyInGroup = await GroupMember.findOne({ where: { userId: invitedUserId, groupId } });
        if (alreadyInGroup) return res.status(400).json({ message: "User is already in the group" });

        // Add the invited user to the group
        await GroupMember.create({ userId: invitedUserId, groupId });

        res.status(201).json({ message: "User invited successfully" });
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ message: "Server error" });
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
