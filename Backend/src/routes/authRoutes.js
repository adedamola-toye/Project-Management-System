// src/routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const projectRoleAuth = require('../middleware/projectRoleAuth');
const projectRoleController = require('../controllers/projectRoleController')
const router = express.Router();

// User registration route
router.post('/signup', authController.signup);

//Email verification route
router.get('/verify-email', authController.verifyEmail);


// User login route
router.post('/login', authController.login);

// Verify user
router.get('/profile', authMiddleware.protect, (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

router.post('/refresh-token', authController.refreshToken);



module.exports = router;
