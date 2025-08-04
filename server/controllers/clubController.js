const prisma = require('../utils/database');
const { getFileUrl } = require('../middleware/upload');

// Create a new club
const createClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, category, isPrivate = false } = req.body;
    const image = req.file;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and category are required'
      });
    }

    const clubData = {
      name,
      description,
      category,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      ownerId: userId
    };

    if (image) {
      clubData.image = image.filename;
    }

    const club = await prisma.club.create({
      data: clubData,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    });

    // Add the owner as the first member with 'owner' role
    await prisma.clubMember.create({
      data: {
        userId,
        clubId: club.id,
        role: 'owner'
      }
    });

    // Add full URL for image
    if (club.image) {
      club.image = getFileUrl(club.image, 'clubs');
    }
    if (club.owner.avatar) {
      club.owner.avatar = getFileUrl(club.owner.avatar, 'avatars');
    }

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: club
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create club'
    });
  }
};

// Get all clubs (with filtering)
const getAllClubs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const clubs = await prisma.club.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        members: {
          where: { userId },
          select: { role: true }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for images and check if user is member
    clubs.forEach(club => {
      if (club.image) {
        club.image = getFileUrl(club.image, 'clubs');
      }
      if (club.owner.avatar) {
        club.owner.avatar = getFileUrl(club.owner.avatar, 'avatars');
      }
      club.isMember = club.members.length > 0;
      club.userRole = club.members[0]?.role || null;
      delete club.members; // Remove members array from response
    });

    const total = await prisma.club.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        clubs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get clubs'
    });
  }
};

// Get club by ID
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        members: {
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
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is member
    const userMembership = club.members.find(member => member.userId === userId);
    club.isMember = !!userMembership;
    club.userRole = userMembership?.role || null;

    // Add full URLs for images
    if (club.image) {
      club.image = getFileUrl(club.image, 'clubs');
    }
    if (club.owner.avatar) {
      club.owner.avatar = getFileUrl(club.owner.avatar, 'avatars');
    }
    club.members.forEach(member => {
      if (member.user.avatar) {
        member.user.avatar = getFileUrl(member.user.avatar, 'avatars');
      }
    });

    res.json({
      success: true,
      data: club
    });
  } catch (error) {
    console.error('Get club by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get club'
    });
  }
};

// Join a club
const joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is already a member
    if (club.members.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    if (club.isPrivate) {
      // Create join request for private clubs
      const joinRequest = await prisma.clubJoinRequest.create({
        data: {
          userId,
          clubId: id,
          message
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

      res.json({
        success: true,
        message: 'Join request sent successfully',
        data: joinRequest
      });
    } else {
      // Direct join for public clubs
      const membership = await prisma.clubMember.create({
        data: {
          userId,
          clubId: id,
          role: 'member'
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

      res.json({
        success: true,
        message: 'Successfully joined the club',
        data: membership
      });
    }
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join club'
    });
  }
};

// Leave a club
const leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member
    const membership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId: id
        }
      }
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this club'
      });
    }

    // Check if user is the owner
    if (membership.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Club owner cannot leave. Transfer ownership first.'
      });
    }

    await prisma.clubMember.delete({
      where: {
        userId_clubId: {
          userId,
          clubId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the club'
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave club'
    });
  }
};

// Create a club post
const createClubPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;
    const image = req.file;

    // Check if user is a member
    const membership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId: id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to post in this club'
      });
    }

    const postData = {
      content,
      authorId: userId,
      clubId: id
    };

    if (image) {
      postData.image = image.filename;
    }

    const post = await prisma.clubPost.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            clubComments: true,
            clubLikes: true
          }
        }
      }
    });

    // Add full URL for image
    if (post.image) {
      post.image = getFileUrl(post.image, 'club-posts');
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
    console.error('Create club post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Get club posts
const getClubPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await prisma.clubPost.findMany({
      where: { clubId: id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            clubComments: true,
            clubLikes: true
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
        post.image = getFileUrl(post.image, 'club-posts');
      }
      if (post.author.avatar) {
        post.author.avatar = getFileUrl(post.author.avatar, 'avatars');
      }
    });

    const total = await prisma.clubPost.count({
      where: { clubId: id }
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
    console.error('Get club posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get club posts'
    });
  }
};

// Get user's clubs
const getUserClubs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const memberships = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            _count: {
              select: {
                members: true,
                posts: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for images
    memberships.forEach(membership => {
      if (membership.club.image) {
        membership.club.image = getFileUrl(membership.club.image, 'clubs');
      }
      if (membership.club.owner.avatar) {
        membership.club.owner.avatar = getFileUrl(membership.club.owner.avatar, 'avatars');
      }
    });

    const total = await prisma.clubMember.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        clubs: memberships.map(m => ({
          ...m.club,
          userRole: m.role,
          joinedAt: m.joinedAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user clubs'
    });
  }
};

// Get club members
const getClubMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is a member of the club
    const userMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: id
        }
      }
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view club members'
      });
    }

    const members = await prisma.clubMember.findMany({
      where: { clubId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // owner first, then admin, then members
        { joinedAt: 'asc' }
      ],
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for avatars
    members.forEach(member => {
      if (member.user.avatar) {
        member.user.avatar = getFileUrl(member.user.avatar, 'avatars');
      }
    });

    const total = await prisma.clubMember.count({
      where: { clubId: id }
    });

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get club members'
    });
  }
};

// Get club join requests (for club owners/admins only)
const getClubJoinRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is owner or admin of the club
    const userMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: id
        }
      }
    });

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only club owners and admins can view join requests'
      });
    }

    const joinRequests = await prisma.clubJoinRequest.findMany({
      where: { 
        clubId: id,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add full URLs for avatars
    joinRequests.forEach(request => {
      if (request.user.avatar) {
        request.user.avatar = getFileUrl(request.user.avatar, 'avatars');
      }
    });

    const total = await prisma.clubJoinRequest.count({
      where: { 
        clubId: id,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: {
        joinRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get club join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get club join requests'
    });
  }
};

// Handle join request (approve/reject)
const handleJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    // Check if user is owner or admin of the club
    const userMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: id
        }
      }
    });

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only club owners and admins can handle join requests'
      });
    }

    // Get the join request
    const joinRequest = await prisma.clubJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        club: true
      }
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    if (joinRequest.clubId !== id) {
      return res.status(400).json({
        success: false,
        message: 'Join request does not belong to this club'
      });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Join request has already been processed'
      });
    }

    if (action === 'approve') {
      // Check if user is already a member
      const existingMember = await prisma.clubMember.findUnique({
        where: {
          userId_clubId: {
            userId: joinRequest.userId,
            clubId: id
          }
        }
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this club'
        });
      }

      // Add user as member and update join request status
      await prisma.$transaction([
        prisma.clubMember.create({
          data: {
            userId: joinRequest.userId,
            clubId: id,
            role: 'member'
          }
        }),
        prisma.clubJoinRequest.update({
          where: { id: requestId },
          data: { status: 'approved' }
        })
      ]);

      res.json({
        success: true,
        message: 'Join request approved successfully'
      });
    } else {
      // Reject the join request
      await prisma.clubJoinRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' }
      });

      res.json({
        success: true,
        message: 'Join request rejected successfully'
      });
    }
  } catch (error) {
    console.error('Handle join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle join request'
    });
  }
};

// Add member directly (for club owners/admins)
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user is owner or admin of the club
    const userMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: id
        }
      }
    });

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only club owners and admins can add members'
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: userId,
          clubId: id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this club'
      });
    }

    // Add user as member
    const newMember = await prisma.clubMember.create({
      data: {
        userId: userId,
        clubId: id,
        role: role
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

    // Add full URL for avatar
    if (newMember.user.avatar) {
      newMember.user.avatar = getFileUrl(newMember.user.avatar, 'avatars');
    }

    res.json({
      success: true,
      message: 'Member added successfully',
      data: newMember
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
};

// Remove member (for club owners/admins)
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // Check if user is owner or admin of the club
    const userMembership = await prisma.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: id
        }
      }
    });

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only club owners and admins can remove members'
      });
    }

    // Get the member to be removed
    const memberToRemove = await prisma.clubMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (memberToRemove.clubId !== id) {
      return res.status(400).json({
        success: false,
        message: 'Member does not belong to this club'
      });
    }

    // Prevent removing the owner
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the club owner'
      });
    }

    // Prevent removing yourself if you're an admin
    if (memberToRemove.userId === req.user.id && userMembership.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot remove themselves'
      });
    }

    // Remove the member
    await prisma.clubMember.delete({
      where: { id: memberId }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  joinClub,
  leaveClub,
  createClubPost,
  getClubPosts,
  getUserClubs,
  getClubMembers,
  getClubJoinRequests,
  handleJoinRequest,
  addMember,
  removeMember
}; 