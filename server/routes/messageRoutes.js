const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// Send a message
router.post('/', authenticateToken, messageController.sendMessage);
// Get chat history with a user
router.get('/', authenticateToken, messageController.getMessages);

module.exports = router; 