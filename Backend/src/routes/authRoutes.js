const express = require('express');
const {
  signup,
  login,
  refreshToken,
  checkTokenExpiry
} = require("../controllers/authController");

const authMiddleware = require('../middleware/authMiddleware');
const projectRoleAuth = require('../middleware/projectRoleAuth');
const projectRoleController = require('../controllers/projectRoleController');

const router = express.Router();

// User registration route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Get user profile - protected route
router.get('/profile', authMiddleware.protect, (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

// Refresh access token
router.post('/refresh-token', refreshToken);

router.get('/check-token-expiry', checkTokenExpiry);

module.exports = router;