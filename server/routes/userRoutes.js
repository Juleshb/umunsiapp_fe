const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const { userValidation } = require('../utils/validation');

// Register
router.post('/register', userValidation.register, authController.register);

// Login
router.post('/login', userValidation.login, authController.login);

// Get current user profile
router.get('/me', authenticateToken, authController.getProfile);

// Update profile (with avatar upload)
router.put('/me', authenticateToken, uploadConfigs.avatar, handleUploadError, userValidation.update, authController.updateProfile);

// Update cover image
router.put('/me/cover', authenticateToken, uploadConfigs.coverImage, handleUploadError, authController.updateCoverImage);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Search users
router.get('/', authenticateToken, authController.searchUsers);

// Get user by ID (public profile) - must come after /me routes
router.get('/:userId', optionalAuth, authController.getUserById);

// Get profile statistics
router.get('/profile/statistics', authenticateToken, userController.getProfileStatistics);

module.exports = router; 