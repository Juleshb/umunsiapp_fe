const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get profile statistics for the current user
const getProfileStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    // Total posts
    const totalPosts = await prisma.post.count({ where: { authorId: userId } });
    // Total articles
    const totalArticles = await prisma.article.count({ where: { authorId: userId } });
    // Total friends
    const totalFriends = await prisma.friendship.count({ where: { userId } });
    // Total sent friend requests (not accepted)
    const totalSentFriendRequests = await prisma.friendRequest.count({ where: { senderId: userId, status: 'pending' } });
    // Most liked article
    const mostLikedArticle = await prisma.article.findFirst({
      where: { authorId: userId },
      orderBy: { articleLikes: { _count: 'desc' } },
      include: { articleLikes: true },
    });
    // Recent articles (last 5)
    const recentArticles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    // Chat analysis: total chats (distinct users), total messages sent/received
    const totalChats = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const totalMessagesSent = await prisma.message.count({ where: { senderId: userId } });
    const totalMessagesReceived = await prisma.message.count({ where: { receiverId: userId } });
    res.json({
      totalPosts,
      totalArticles,
      totalFriends,
      totalSentFriendRequests,
      mostLikedArticle,
      recentArticles,
      chatAnalysis: {
        totalChats: totalChats.length,
        totalMessagesSent,
        totalMessagesReceived,
      },
    });
  } catch (error) {
    console.error('Get profile statistics error:', error);
    res.status(500).json({ message: 'Failed to get profile statistics' });
  }
};

module.exports = {
  getProfileStatistics,
}; 