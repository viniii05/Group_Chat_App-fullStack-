const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Group, GroupMember, ChatMessage } = require("../models");

const rootDir = require('../util/path');

require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

exports.getSignupForm = (req,res) => {
    res.sendFile(path.join(rootDir,'views','signup.html'));
};

exports.getLoginForm = (req,res) => {
    res.sendFile(path.join(rootDir,'views','login.html'));
}

exports.postSignupData = async (req, res) => {
    try {
        const { name, email, phonenumber, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, phonenumber, password: hashedPassword });

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error("Signup error:", error); // ✅ Add this for debugging
        return res.status(500).json({ error: "Error creating user" });
    }
};

exports.postLoginData = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "User not authorized" });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
        console.log(token);

        res.json({
            message: "Login successful",
            token,
            redirect: "/chat.html" // Correct redirect URL
        });    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

