const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.postSignupData);
router.post('/login', userController.postLoginData);

router.get('/login', userController.getLoginForm);
router.get('/signup', userController.getSignupForm);


const User = require("../models/User");
const authenticateUser = require('../middlewares/authenticateUser');

router.get("/user", authenticateUser.authenticateUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ["name"] });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

module.exports = router;


module.exports = router;







