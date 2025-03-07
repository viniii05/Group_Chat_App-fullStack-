const bcrypt = require('bcryptjs');
const User = require('../models/UserData');
const path = require('path');
const rootDir = require('../util/path');

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


