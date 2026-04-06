const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updatePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateUpdatePassword } = require('../middleware/validation.middleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.put('/update-password', protect, validateUpdatePassword, updatePassword);

module.exports = router;
