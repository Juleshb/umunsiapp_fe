const prisma = require('../utils/database');

// Plan features and limits
const PLAN_FEATURES = {
  FREE: {
    maxStories: 3,
    maxPostImages: 1,
    maxMessageImages: 1,
    maxPosts: 1, // Free users can only create 1 post
    canCreateGroups: false,
    canUseAdvancedFilters: false,
    canSeeWhoViewedProfile: false,
    canUseCustomThemes: false,
    maxFriends: 100,
    maxFollowers: 500,
    canSchedulePosts: false,
    canUseAnalytics: false
  },
  PREMIUM: {
    maxStories: 10,
    maxPostImages: 5,
    maxMessageImages: 3,
    maxPosts: -1, // Unlimited posts for premium
    canCreateGroups: true,
    canUseAdvancedFilters: true,
    canSeeWhoViewedProfile: true,
    canUseCustomThemes: true,
    maxFriends: 1000,
    maxFollowers: 10000,
    canSchedulePosts: true,
    canUseAnalytics: true
  }
};

// Check if user has access to a feature
const hasFeatureAccess = (userPlan, feature) => {
  const planFeatures = PLAN_FEATURES[userPlan];
  return planFeatures && planFeatures[feature] !== undefined;
};

// Check if user can perform an action based on their plan
const canPerformAction = (userPlan, action) => {
  const planFeatures = PLAN_FEATURES[userPlan];
  
  switch (action) {
    case 'createStory':
      return true; // Both plans can create stories
    case 'createPost':
      return userPlan === 'PREMIUM'; // Only premium can create posts (free users limited to 1)
    case 'uploadMultipleImages':
      return userPlan === 'PREMIUM';
    case 'createGroup':
      return userPlan === 'PREMIUM';
    case 'useAdvancedFilters':
      return userPlan === 'PREMIUM';
    case 'seeProfileViews':
      return userPlan === 'PREMIUM';
    case 'useCustomThemes':
      return userPlan === 'PREMIUM';
    case 'schedulePosts':
      return userPlan === 'PREMIUM';
    case 'useAnalytics':
      return userPlan === 'PREMIUM';
    default:
      return true;
  }
};

// Get plan limits for a user
const getPlanLimits = (userPlan) => {
  return PLAN_FEATURES[userPlan] || PLAN_FEATURES.FREE;
};

// Check if user's plan is active (not expired)
const isPlanActive = (user) => {
  if (user.plan === 'FREE') return true;
  if (!user.planExpiresAt) return false;
  return new Date() < user.planExpiresAt;
};

// Upgrade user to premium plan
const upgradeToPremium = async (userId, durationMonths = 1) => {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'PREMIUM',
      planExpiresAt: expiresAt
    },
    select: {
      id: true,
      plan: true,
      planExpiresAt: true
    }
  });

  return user;
};

// Downgrade user to free plan
const downgradeToFree = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'FREE',
      planExpiresAt: null
    },
    select: {
      id: true,
      plan: true,
      planExpiresAt: true
    }
  });

  return user;
};

// Check if user can add more friends
const canAddFriend = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      _count: {
        select: {
          friends: true
        }
      }
    }
  });

  if (!user) return false;

  const limits = getPlanLimits(user.plan);
  return user._count.friends < limits.maxFriends;
};

// Check if user can create more stories
const canCreateStory = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      _count: {
        select: {
          stories: true
        }
      }
    }
  });

  if (!user) return false;

  const limits = getPlanLimits(user.plan);
  return user._count.stories < limits.maxStories;
};

// Check if user can create more posts
const canCreatePost = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      isStudent: true,
      _count: {
        select: {
          posts: true
        }
      }
    }
  });

  if (!user) return false;

  // Students get premium access
  if (user.isStudent) {
    return true; // Unlimited posts for students
  }

  const limits = getPlanLimits(user.plan);
  
  // Premium users have unlimited posts
  if (user.plan === 'PREMIUM') {
    return true;
  }

  // Free users are limited to 1 post
  return user._count.posts < limits.maxPosts;
};

// Get student premium access
const getStudentPremiumAccess = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isStudent: true,
      plan: true,
      planExpiresAt: true
    }
  });

  if (!user || !user.isStudent) {
    return null;
  }

  // If student doesn't have premium, give them premium access
  if (user.plan !== 'PREMIUM') {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 4); // 4 years for student access

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'PREMIUM',
        planExpiresAt: expiresAt
      },
      select: {
        id: true,
        plan: true,
        planExpiresAt: true,
        isStudent: true
      }
    });

    return updatedUser;
  }

  return user;
};

// Get plan comparison for upgrade page
const getPlanComparison = () => {
  return {
    free: {
      name: 'Free',
      price: 0,
      features: PLAN_FEATURES.FREE,
      limitations: [
        'Limited to 1 post only',
        'Limited to 3 stories',
        '1 image per post',
        'Basic features only',
        'No analytics',
        'No custom themes'
      ]
    },
    premium: {
      name: 'Premium',
      price: 9.99,
      features: PLAN_FEATURES.PREMIUM,
      benefits: [
        'Unlimited posts',
        'Up to 10 stories',
        '5 images per post',
        'Advanced filters',
        'Profile view analytics',
        'Custom themes',
        'Post scheduling',
        'Group creation'
      ]
    },
    student: {
      name: 'Student',
      price: 0,
      features: PLAN_FEATURES.PREMIUM,
      benefits: [
        'Free premium access for 4 years',
        'Unlimited posts',
        'Up to 10 stories',
        '5 images per post',
        'Advanced filters',
        'Profile view analytics',
        'Custom themes',
        'Post scheduling',
        'Group creation'
      ],
      requirements: [
        'Must be a student',
        'Valid student email required'
      ]
    }
  };
};

// Check for expired premium plans and downgrade them
const checkExpiredPlans = async () => {
  const expiredUsers = await prisma.user.findMany({
    where: {
      plan: 'PREMIUM',
      planExpiresAt: {
        lt: new Date()
      }
    }
  });

  for (const user of expiredUsers) {
    await downgradeToFree(user.id);
  }

  return expiredUsers.length;
};

module.exports = {
  PLAN_FEATURES,
  hasFeatureAccess,
  canPerformAction,
  getPlanLimits,
  isPlanActive,
  upgradeToPremium,
  downgradeToFree,
  canAddFriend,
  canCreateStory,
  canCreatePost,
  getStudentPremiumAccess,
  getPlanComparison,
  checkExpiredPlans
}; 