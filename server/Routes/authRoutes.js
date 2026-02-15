const express = require('express');
const router = express.Router();
const { Login, Register } = require('../Controllers/authController');
const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

router.post('/login', Login);
router.post('/register', protect, authorize(['Admin']), Register);

module.exports = router;