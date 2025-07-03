const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { authenticateToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Friend request routes
router.post('/request', friendController.sendRequest);
router.put('/request/:requestId/accept', friendController.acceptRequest);
router.put('/request/:requestId/reject', friendController.rejectRequest);
router.delete('/request/:requestId', friendController.cancelRequest);

// Friend management routes
router.delete('/:friendId', friendController.removeFriend);
router.get('/', friendController.getFriends);
router.get('/requests', friendController.getRequests);

module.exports = router; 