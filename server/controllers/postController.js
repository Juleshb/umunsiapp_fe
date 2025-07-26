const prisma = require('../utils/database');
const { getFileUrl } = require('../middleware/upload');
const planService = require('../services/planService');

// Post Controller

// Create post
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, location, isPublic = true } = req.body;
    const image = req.file;

    // Check if user can create more posts
    const canCreate = await planService.canCreatePost(userId);
    if (!canCreate) {
      return res.status(403).json({
        success: false,
        message: 'You have reached your post limit. Upgrade to premium for unlimited posts!'
      });
    }

    const postData = {
      content,
      location,
      isPublic,
      authorId: userId
    };

    if (image) {
      postData.image = image.filename;
    }

    const post = await prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });

    // Add full URL for image
    if (post.image) {
      post.image = getFileUrl(post.image, 'posts');
    }
    if (post.author.avatar) {
      post.author.avatar = getFileUrl(post.author.avatar, 'avatars');
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Get all posts (feed)
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's friends
    const userFriendships = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true }
    });
    
    const friendIds = userFriendships.map(f => f.friendId);

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { isPublic: true },
          { authorId: userId },
          { authorId: { in: friendIds } }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for images
    posts.forEach(post => {
      if (post.image) {
        post.image = getFileUrl(post.image, 'posts');
      }
      if (post.author.avatar) {
        post.author.avatar = getFileUrl(post.author.avatar, 'avatars');
      }
    });

    const total = await prisma.post.count({
      where: {
        OR: [
          { isPublic: true },
          { authorId: userId },
          { authorId: { in: friendIds } }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts'
    });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can view this post
    if (!post.isPublic && post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this post'
      });
    }

    // Add full URLs for images
    if (post.image) {
      post.image = getFileUrl(post.image, 'posts');
    }
    if (post.author.avatar) {
      post.author.avatar = getFileUrl(post.author.avatar, 'avatars');
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, location, isPublic } = req.body;
    const image = req.file;

    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (location !== undefined) updateData.location = location;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (image) updateData.image = image.filename;

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });

    // Add full URL for image
    if (post.image) {
      post.image = getFileUrl(post.image, 'posts');
    }
    if (post.author.avatar) {
      post.author.avatar = getFileUrl(post.author.avatar, 'avatars');
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Toggle like/unlike post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io');

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isLiked;
    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      isLiked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });
      isLiked = true;
    }

    // Get new like count
    const likeCount = await prisma.like.count({ where: { postId } });

    // Emit real-time update
    if (io) {
      io.emit('post-like-updated', { postId, likeCount });
    }

    res.json({
      success: true,
      message: isLiked ? 'Post liked' : 'Post unliked',
      isLiked,
      likeCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Share post
const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const share = await prisma.share.create({
      data: {
        userId,
        postId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (share.user.avatar) {
      share.user.avatar = getFileUrl(share.user.avatar, 'avatars');
    }

    res.json({
      success: true,
      message: 'Post shared successfully',
      data: share
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, parentId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        }
      }
    });

    if (comment.author.avatar) {
      comment.author.avatar = getFileUrl(comment.author.avatar, 'avatars');
    }

    // Emit real-time update after adding comment
    const io = req.app.get('io');
    if (io) {
      // Get latest comment count and comments (first page, top-level only)
      const commentCount = await prisma.comment.count({ where: { postId } });
      const comments = await prisma.comment.findMany({
        where: { postId, parentId: null },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isStudent: true,
              plan: true
            }
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  isStudent: true,
                  plan: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      comments.forEach(comment => {
        if (comment.author.avatar) {
          comment.author.avatar = getFileUrl(comment.author.avatar, 'avatars');
        }
        comment.replies.forEach(reply => {
          if (reply.author.avatar) {
            reply.author.avatar = getFileUrl(reply.author.avatar, 'avatars');
          }
        });
      });
      io.emit('post-comment-updated', { postId, commentCount, comments });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// Get comments
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isStudent: true,
            plan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for avatars
    comments.forEach(comment => {
      if (comment.author.avatar) {
        comment.author.avatar = getFileUrl(comment.author.avatar, 'avatars');
      }
    });

    const total = await prisma.comment.count({
      where: { postId }
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comments'
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
  addComment,
  getComments,
  deleteComment
}; 