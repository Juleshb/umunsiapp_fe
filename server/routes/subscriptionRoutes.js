const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

// Get current user's plan information
router.get('/plan', authenticateToken, subscriptionController.getPlanInfo);

// Get plan comparison
router.get('/plans', subscriptionController.getPlanComparison);

// Upgrade to premium
router.post('/upgrade', authenticateToken, subscriptionController.upgradeToPremium);

// Cancel premium plan
router.post('/cancel', authenticateToken, subscriptionController.cancelPremium);

// Check feature access
router.get('/features/:feature', authenticateToken, subscriptionController.checkFeatureAccess);

// Get usage statistics
router.get('/usage', authenticateToken, subscriptionController.getUsageStats);

module.exports = router; 