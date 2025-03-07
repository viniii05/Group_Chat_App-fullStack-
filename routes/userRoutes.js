const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getSignupForm);
router.post('/signup', userController.postSignupData)

module.exports = router;







