const prisma = require('../utils/database');
const planService = require('../services/planService');

// Get current user's plan information
const getPlanInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        planExpiresAt: true,
        _count: {
          select: {
            friends: true,
            stories: true,
            followers: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const planLimits = planService.getPlanLimits(user.plan);
    const isActive = planService.isPlanActive(user);

    res.json({
      success: true,
      data: {
        currentPlan: user.plan,
        planExpiresAt: user.planExpiresAt,
        isActive,
        limits: planLimits,
        usage: {
          friends: user._count.friends,
          stories: user._count.stories,
          followers: user._count.followers
        }
      }
    });
  } catch (error) {
    console.error('Get plan info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan information'
    });
  }
};

// Get plan comparison
const getPlanComparison = async (req, res) => {
  try {
    const comparison = planService.getPlanComparison();

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Get plan comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plan comparison'
    });
  }
};

// Upgrade to premium plan
const upgradeToPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMonths = 1 } = req.body;

    // Validate duration
    if (![1, 3, 6, 12].includes(durationMonths)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration. Must be 1, 3, 6, or 12 months'
      });
    }

    // Check if user is already premium
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true }
    });

    if (currentUser.plan === 'PREMIUM' && planService.isPlanActive(currentUser)) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active premium plan'
      });
    }

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate a successful payment

    const updatedUser = await planService.upgradeToPremium(userId, durationMonths);

    res.json({
      success: true,
      message: 'Successfully upgraded to premium plan',
      data: {
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt
      }
    });
  } catch (error) {
    console.error('Upgrade to premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade plan'
    });
  }
};

// Cancel premium plan
const cancelPremium = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    if (currentUser.plan !== 'PREMIUM') {
      return res.status(400).json({
        success: false,
        message: 'You do not have a premium plan to cancel'
      });
    }

    // In a real application, you would handle subscription cancellation with the payment processor
    // For now, we'll immediately downgrade the user

    const updatedUser = await planService.downgradeToFree(userId);

    res.json({
      success: true,
      message: 'Premium plan cancelled successfully',
      data: {
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt
      }
    });
  } catch (error) {
    console.error('Cancel premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel premium plan'
    });
  }
};

// Check feature access
const checkFeatureAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { feature } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasAccess = planService.hasFeatureAccess(user.plan, feature);
    const canPerform = planService.canPerformAction(user.plan, feature);

    res.json({
      success: true,
      data: {
        feature,
        hasAccess,
        canPerform,
        userPlan: user.plan
      }
    });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature access'
    });
  }
};

// Get usage statistics
const getUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        _count: {
          select: {
            friends: true,
            stories: true,
            followers: true,
            posts: true,
            sentMessages: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const limits = planService.getPlanLimits(user.plan);

    res.json({
      success: true,
      data: {
        usage: {
          friends: {
            current: user._count.friends,
            limit: limits.maxFriends,
            percentage: Math.round((user._count.friends / limits.maxFriends) * 100)
          },
          stories: {
            current: user._count.stories,
            limit: limits.maxStories,
            percentage: Math.round((user._count.stories / limits.maxStories) * 100)
          },
          followers: {
            current: user._count.followers,
            limit: limits.maxFollowers,
            percentage: Math.round((user._count.followers / limits.maxFollowers) * 100)
          }
        },
        totalPosts: user._count.posts,
        totalMessages: user._count.sentMessages
      }
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics'
    });
  }
};

module.exports = {
  getPlanInfo,
  getPlanComparison,
  upgradeToPremium,
  cancelPremium,
  checkFeatureAccess,
  getUsageStats
}; 