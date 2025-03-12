const {  Group, GroupMember , User } = require("../models");

exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.findAll({
            include: {
                model: GroupMember,
                where: { userId },
                attributes: ["isAdmin"], // Include admin status
            },
            attributes: ["id", "name"],
        });

        res.json(groups);
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
};

// ✅ Create a new group and make the creator an admin
exports.createGroup = async (req, res) => {
    console.log("Received body:", req.body);
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) return res.status(400).json({ message: "Group name is required" });

        // Create a new group with the creator
        const group = await Group.create({ name, createdBy: userId });

        // Add the creator as the first member (Admin)
        await GroupMember.create({ userId, groupId: group.id, isAdmin: true });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { groupId, email } = req.body;

        if (!req.body.email) {
            return res.status(400).json({ message: "Email is required!" });
        }

        // Fetch the user's ID using their email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is already a member
        const existingMember = await GroupMember.findOne({
            where: { userId: user.id, groupId }
        });

        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        // Add user to the group
        await GroupMember.create({
            userId: user.id, // Use integer user ID
            groupId,
            isAdmin: false,
        });

        res.status(201).json({ message: 'User invited successfully' });

    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// ✅ Get groups of a specific user (Only Admins Can View Others' Groups)
exports.getUserGroupsById = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        // Check if the requester is an admin
        const isAdmin = await GroupMember.findOne({ where: { userId: adminId, isAdmin: true } });

        if (!isAdmin) return res.status(403).json({ message: "Only admins can fetch user groups" });

        const userGroups = await Group.findAll({
            include: {
                model: GroupMember,
                where: { userId },
                attributes: ["isAdmin"],
            },
            attributes: ["id", "name"],
        });

        res.status(200).json(userGroups);
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.makeAdmin = async (req, res) => {
    const { groupId, userId } = req.body;
    const adminUserId = req.user.id; // ID of the current logged-in user

    try {
        // Check if the logged-in user is an admin of the group
        const adminMember = await GroupMember.findOne({ where: { groupId, userId: adminUserId } });
        if (!adminMember || !adminMember.isAdmin) {
            return res.status(403).json({ message: "Only admins can promote other users" });
        }

        // Update the user's role in the group
        const member = await GroupMember.findOne({ where: { groupId, userId } });
        if (!member) return res.status(404).json({ message: "User not found in group" });

        await member.update({ isAdmin: true });

        res.json({ message: "User promoted to admin" });
    } catch (error) {
        console.error("Error making admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeUser = async (req, res) => {
    const { groupId, userId } = req.body;
    const adminUserId = req.user.id;

    try {
        // Check if the logged-in user is an admin
        const adminMember = await GroupMember.findOne({ where: { groupId, userId: adminUserId } });
        if (!adminMember || !adminMember.isAdmin) {
            return res.status(403).json({ message: "Only admins can remove users" });
        }

        // Ensure the user exists in the group
        const member = await GroupMember.findOne({ where: { groupId, userId } });
        if (!member) return res.status(404).json({ message: "User not found in group" });

        await member.destroy();

        res.json({ message: "User removed from group" });
    } catch (error) {
        console.error("Error removing user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    try {
        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        console.log(`Fetching members for group ID: ${groupId}`);

        const members = await GroupMember.findAll({
            where: { groupId },
            include: [
                {
                    model: User, // ✅ Ensure this is correctly associated
                    as: "User",  // ✅ Add `as` if necessary
                    attributes: ["id", "name", "email"]
                }
            ]
            
        });

        if (!members || members.length === 0) {
            return res.status(404).json({ message: "No members found for this group" });
        }

        res.json(members.map(member => ({
            id: member.User.id,
            name: member.User.name,
            email: member.User.email,
            isAdmin: member.isAdmin
        })));
    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



const changeAdminStatus = async (req, res) => {
    try {
        const { groupId, userId, makeAdmin } = req.body;
        const adminId = req.user.id;

        // Check if requester is an admin
        const adminCheck = await GroupMember.findOne({ where: { groupId, userId: adminId, isAdmin: true } });
        if (!adminCheck) return res.status(403).json({ message: "Only admins can change roles" });

        // Update admin status
        await GroupMember.update({ isAdmin: makeAdmin }, { where: { groupId, userId } });

        res.status(200).json({ message: `User ${makeAdmin ? "promoted" : "demoted"} successfully` });
    } catch (error) {
        res.status(500).json({ message: "Error updating admin status", error });
    }
};
