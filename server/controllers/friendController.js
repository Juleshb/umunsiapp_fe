const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Send friend request
const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself'
      });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
};

// Accept friend request
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
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

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (friendRequest.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests sent to you'
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Friend request has already been processed'
      });
    }

    // Create friendship (both ways)
    await prisma.friendship.createMany({
      data: [
        {
          userId: friendRequest.senderId,
          friendId: friendRequest.receiverId
        },
        {
          userId: friendRequest.receiverId,
          friendId: friendRequest.senderId
        }
      ],
      skipDuplicates: true
    });

    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    res.json({
      success: true,
      message: 'Friend request accepted successfully',
      data: friendRequest.sender
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request'
    });
  }
};

// Reject friend request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (friendRequest.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests sent to you'
      });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    res.json({
      success: true,
      message: 'Friend request rejected successfully'
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject friend request'
    });
  }
};

// Cancel friend request
const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (friendRequest.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel requests you sent'
      });
    }

    await prisma.friendRequest.delete({
      where: { id: requestId }
    });

    res.json({
      success: true,
      message: 'Friend request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel friend request'
    });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Delete both friendship records
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          {
            userId,
            friendId
          },
          {
            userId: friendId,
            friendId: userId
          }
        ]
      }
    });

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const friends = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
            lastSeen: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.friendship.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        friends: friends.map(f => f.friend),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friends'
    });
  }
};

// Get friend requests
const getRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'received' } = req.query; // 'received' or 'sent'

    const whereClause = type === 'sent' 
      ? { senderId: userId }
      : { receiverId: userId };

    const requests = await prisma.friendRequest.findMany({
      where: {
        ...whereClause,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friend requests'
    });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  removeFriend,
  getFriends,
  getRequests,
}; 