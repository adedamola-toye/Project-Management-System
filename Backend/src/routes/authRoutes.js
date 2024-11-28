// src/routes/authRoutes.js

const express = require('express');

const {
  signup,
  login,
  verifyEmail,
  refreshToken
} = require("../controllers/authController");

const authMiddleware = require('../middleware/authMiddleware');
const projectRoleAuth = require('../middleware/projectRoleAuth');
const projectRoleController = require('../controllers/projectRoleController')
const router = express.Router();

// User registration route
router.post('/signup',signup);

//Email verification route
router.get('/verify-email', verifyEmail);


// User login route
router.post('/login', login);

// Verify user
router.get('/profile', authMiddleware.protect, (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

router.post('/refresh-token', refreshToken);



module.exports = router;
