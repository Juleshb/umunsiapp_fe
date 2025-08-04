const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getFileUrl } = require('../middleware/upload');

// Create story
const createStory = async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.filename : null;
    const userId = req.user.id;

    // Check user's subscription plan for story limits
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check story limits based on plan
    if (user.plan === 'FREE') {
      const todayStories = await prisma.story.count({
        where: {
          authorId: userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      if (todayStories >= 3) {
        return res.status(403).json({ 
          success: false, 
          message: 'Free users can only create 3 stories per day. Upgrade to Premium for unlimited stories!'
        });
      }
    }

    // Calculate expiresAt (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        content,
        image,
        authorId: userId,
        expiresAt
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Add full URLs for images
    if (story.image) {
      story.image = getFileUrl(story.image, 'stories');
    }
    if (story.author.avatar) {
      story.author.avatar = getFileUrl(story.author.avatar, 'avatars');
    }

    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('new-story', {
        id: story.id,
        content: story.content,
        image: story.image,
        createdAt: story.createdAt,
        author: story.author
      });
    }

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create story',
      error: error.message
    });
  }
};

// Get all stories (including friends' stories)
const getAllStories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's friends (all friendships are accepted by default)
    const userFriends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      include: {
        user: true,
        friend: true
      }
    });

    // Extract friend IDs
    const friendIds = userFriends.map(friendship => 
      friendship.userId === userId ? friendship.friendId : friendship.userId
    );

    // Get stories from user and friends, created within last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { authorId: userId },
          { 
            authorId: { in: friendIds },
            createdAt: { gte: twentyFourHoursAgo }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        storyLikes: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            storyLikes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add full URLs for images and like information
    stories.forEach(story => {
      if (story.image) {
        story.image = getFileUrl(story.image, 'stories');
      }
      if (story.author.avatar) {
        story.author.avatar = getFileUrl(story.author.avatar, 'avatars');
      }
      
      // Add like information
      story.isLiked = story.storyLikes.length > 0;
      story.likesCount = story._count.storyLikes;
      
      // Remove the raw data
      delete story.storyLikes;
      delete story._count;
    });

    res.json({
      success: true,
      message: 'Stories retrieved successfully',
      data: stories
    });
  } catch (error) {
    console.error('Get all stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stories',
      error: error.message
    });
  }
};

// Get story by ID
const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id: id }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Add full URLs for images and like information
    if (story.image) {
      story.image = getFileUrl(story.image, 'stories');
    }
    if (story.author.avatar) {
      story.author.avatar = getFileUrl(story.author.avatar, 'avatars');
    }
    
    // Add like information
    story.isLiked = story.storyLikes.length > 0;
    story.likesCount = story._count.storyLikes;
    
    // Remove the raw data
    delete story.storyLikes;
    delete story._count;

    // Check if user can view this story (author or friend)
    if (story.authorId !== userId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: userId, friendId: story.authorId },
            { userId: story.authorId, friendId: userId }
          ]
        }
      });

      if (!friendship) {
        return res.status(403).json({
          success: false,
          message: 'You can only view stories from friends'
        });
      }
    }

    res.json({
      success: true,
      message: 'Story retrieved successfully',
      data: story
    });
  } catch (error) {
    console.error('Get story by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve story',
      error: error.message
    });
  }
};

// Update story
const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const image = req.file ? req.file.filename : null;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id: id }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own stories'
      });
    }

    const updatedStory = await prisma.story.update({
      where: { id: id },
      data: {
        content,
        image: image || story.image
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Add full URLs for images
    if (updatedStory.image) {
      updatedStory.image = getFileUrl(updatedStory.image, 'stories');
    }
    if (updatedStory.author.avatar) {
      updatedStory.author.avatar = getFileUrl(updatedStory.author.avatar, 'avatars');
    }

    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('story-updated', {
        id: updatedStory.id,
        content: updatedStory.content,
        image: updatedStory.image,
        updatedAt: updatedStory.updatedAt,
        author: updatedStory.author
      });
    }

    res.json({
      success: true,
      message: 'Story updated successfully',
      data: updatedStory
    });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update story',
      error: error.message
    });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id: id }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own stories'
      });
    }

    await prisma.story.delete({
      where: { id: id }
    });

    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('story-deleted', id);
    }

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
      error: error.message
    });
  }
};

// Like/Unlike story
const toggleStoryLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id: id }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user already liked the story
    const existingLike = await prisma.storyLike.findUnique({
      where: {
        userId_storyId: {
          userId: userId,
          storyId: id
        }
      }
    });

    if (existingLike) {
      // Unlike the story
      await prisma.storyLike.delete({
        where: {
          userId_storyId: {
            userId: userId,
            storyId: id
          }
        }
      });

      // Emit WebSocket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('story-unliked', {
          storyId: id,
          userId: userId
        });
      }

      res.json({
        success: true,
        message: 'Story unliked successfully',
        data: { liked: false }
      });
    } else {
      // Like the story
      await prisma.storyLike.create({
        data: {
          userId: userId,
          storyId: id
        }
      });

      // Emit WebSocket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('story-liked', {
          storyId: id,
          userId: userId
        });
      }

      res.json({
        success: true,
        message: 'Story liked successfully',
        data: { liked: true }
      });
    }
  } catch (error) {
    console.error('Toggle story like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle story like',
      error: error.message
    });
  }
};

// Get story likes count
const getStoryLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await prisma.story.findUnique({
      where: { id: id }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const likesCount = await prisma.storyLike.count({
      where: { storyId: id }
    });

    const userLiked = await prisma.storyLike.findUnique({
      where: {
        userId_storyId: {
          userId: userId,
          storyId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Story likes retrieved successfully',
      data: {
        likesCount,
        userLiked: !!userLiked
      }
    });
  } catch (error) {
    console.error('Get story likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve story likes',
      error: error.message
    });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  toggleStoryLike,
  getStoryLikes
}; 