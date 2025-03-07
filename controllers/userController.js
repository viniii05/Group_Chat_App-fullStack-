const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserData');
const path = require('path');
const rootDir = require('../util/path');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

exports.getSignupForm = (req,res) => {
    res.sendFile(path.join(rootDir,'views','signup.html'));
};

exports.getLoginForm = (req,res) => {
    res.sendFile(path.join(rootDir,'views','login.html'));
};

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
        console.error("Signup error:", error); 
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
            return res.status(401).json({ error: "Wrong Email or Password" });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
