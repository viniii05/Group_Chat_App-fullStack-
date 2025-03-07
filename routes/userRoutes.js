const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.postSignupData);

router.get('/user/login', userController.getLoginForm);
router.get('/user/signup', userController.getSignupForm);

module.exports = router;







