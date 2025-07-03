const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/database');
const { getFileUrl } = require('../middleware/upload');
const planService = require('../services/planService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, isStudent = false } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine initial plan based on student status
    let initialPlan = 'FREE';
    let planExpiresAt = null;

    if (isStudent) {
      initialPlan = 'PREMIUM';
      planExpiresAt = new Date();
      planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 4); // 4 years for students
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        isStudent,
        plan: initialPlan,
        planExpiresAt
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isStudent: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: isStudent ? 'Student account created with premium access!' : 'User registered successfully',
      data: {
        user,
        token,
        planInfo: {
          currentPlan: user.plan,
          planExpiresAt: user.planExpiresAt,
          isStudent: user.isStudent,
          benefits: isStudent ? 'You have premium access for 4 years as a student!' : 'You have free plan access'
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        password: true,
        avatar: true,
        bio: true,
        isStudent: true,
        plan: true,
        planExpiresAt: true,
        isOnline: true,
        lastSeen: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update online status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastSeen: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        isStudent: true,
        plan: true,
        planExpiresAt: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            friends: true
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

    // Add full URLs for images
    user.avatar = getFileUrl(user.avatar, 'avatars');
    user.coverImage = getFileUrl(user.coverImage, 'covers');

    // Add plan information
    const planLimits = planService.getPlanLimits(user.plan);
    const isPlanActive = planService.isPlanActive(user);

    res.json({
      success: true,
      data: {
        ...user,
        planInfo: {
          currentPlan: user.plan,
          planExpiresAt: user.planExpiresAt,
          isActive: isPlanActive,
          isStudent: user.isStudent,
          limits: planLimits
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio } = req.body;
    const avatar = req.file;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar.filename;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        plan: true,
        planExpiresAt: true,
        isOnline: true,
        lastSeen: true,
        updatedAt: true
      }
    });

    // Add full URL for avatar
    user.avatar = getFileUrl(user.avatar, 'avatars');
    user.coverImage = getFileUrl(user.coverImage, 'covers');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Update cover image
const updateCoverImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const coverImage = req.file;

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Cover image is required'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverImage: coverImage.filename },
      select: {
        id: true,
        coverImage: true,
        updatedAt: true
      }
    });

    user.coverImage = getFileUrl(user.coverImage, 'covers');

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update cover image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cover image'
    });
  }
};

// Get user by ID (public profile)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        plan: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            friends: true
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

    // Add full URLs for images
    user.avatar = getFileUrl(user.avatar, 'avatars');
    user.coverImage = getFileUrl(user.coverImage, 'covers');

    // Check if current user is following this user
    if (currentUserId) {
      const followStatus = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId
          }
        }
      });
      user.isFollowing = !!followStatus;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          },
          { id: { not: currentUserId } } // Exclude current user
        ]
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        plan: true,
        isOnline: true,
        lastSeen: true
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { username: 'asc' }
    });

    // Add full URLs for avatars
    users.forEach(user => {
      user.avatar = getFileUrl(user.avatar, 'avatars');
    });

    const total = await prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          },
          { id: { not: currentUserId } }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update online status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        lastSeen: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateCoverImage,
  getUserById,
  searchUsers,
  logout
}; 