const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get profile statistics for the current user
const getProfileStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Basic counts
    const totalPosts = await prisma.post.count({ where: { authorId: userId } });
    const totalArticles = await prisma.article.count({ where: { authorId: userId } });
    const totalFriends = await prisma.friendship.count({ where: { userId } });
    const totalSentFriendRequests = await prisma.friendRequest.count({ where: { senderId: userId, status: 'pending' } });
    
    // Enhanced engagement metrics
    const totalLikes = await prisma.like.count({ where: { userId } });
    const totalPostLikes = await prisma.post.findMany({
      where: { authorId: userId },
      include: { likes: true }
    });
    const totalPostLikesCount = totalPostLikes.reduce((sum, post) => sum + post.likes.length, 0);
    
    // Article engagement
    const totalArticleLikes = await prisma.article.findMany({
      where: { authorId: userId },
      include: { articleLikes: true }
    });
    const totalArticleLikesCount = totalArticleLikes.reduce((sum, article) => sum + article.articleLikes.length, 0);
    
    // Story engagement
    const totalStories = await prisma.story.count({ where: { authorId: userId } });
    const totalStoryLikes = await prisma.storyLike.count({ where: { userId } });
    
    // Most liked article with enhanced data
    const mostLikedArticle = await prisma.article.findFirst({
      where: { authorId: userId },
      orderBy: { articleLikes: { _count: 'desc' } },
      include: { 
        articleLikes: true,
        _count: {
          select: {
            articleLikes: true,
            comments: true
          }
        }
      },
    });
    
    // Recent articles with engagement data
    const recentArticles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: {
            articleLikes: true,
            comments: true
          }
        }
      }
    });
    
    // Chat analysis with enhanced metrics
    const totalChats = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const totalMessagesSent = await prisma.message.count({ where: { senderId: userId } });
    const totalMessagesReceived = await prisma.message.count({ where: { receiverId: userId } });
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = await prisma.post.count({
      where: { 
        authorId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    const recentArticlesCount = await prisma.article.count({
      where: { 
        authorId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    const recentLikes = await prisma.like.count({
      where: { 
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    const recentStoryLikes = await prisma.storyLike.count({
      where: { 
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    // Club participation
    const totalClubs = await prisma.clubMember.count({ where: { userId } });
    const ownedClubs = await prisma.club.count({ where: { ownerId: userId } });
    
    // Engagement rate calculation
    const totalContent = totalPosts + totalArticles + totalStories;
    const totalEngagement = totalPostLikesCount + totalArticleLikesCount + totalStoryLikes;
    const engagementRate = totalContent > 0 ? Math.round((totalEngagement / totalContent) * 100) : 0;
    
    // Activity score (based on recent activity)
    const activityScore = Math.min(100, (recentPosts * 10) + (recentArticlesCount * 15) + (recentLikes * 2) + (recentStoryLikes * 3));
    
    // Member duration
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const memberSince = user?.createdAt;
    const daysSinceJoin = memberSince ? Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24)) : 0;
    
    // Popular content analysis
    const popularPosts = await prisma.post.findMany({
      where: { authorId: userId },
      include: { likes: true },
      orderBy: { likes: { _count: 'desc' } },
      take: 3
    });
    
    const popularArticles = await prisma.article.findMany({
      where: { authorId: userId },
      include: { articleLikes: true },
      orderBy: { articleLikes: { _count: 'desc' } },
      take: 3
    });
    
    res.json({
      // Basic statistics
      totalPosts,
      totalArticles,
      totalFriends,
      totalSentFriendRequests,
      totalLikes,
      totalStories,
      
      // Enhanced engagement
      totalPostLikes: totalPostLikesCount,
      totalArticleLikes: totalArticleLikesCount,
      totalStoryLikes,
      engagementRate,
      activityScore,
      
      // Recent activity (30 days)
      recentActivity: {
        posts: recentPosts,
        articles: recentArticlesCount,
        likes: recentLikes,
        storyLikes: recentStoryLikes
      },
      
      // Club participation
      totalClubs,
      ownedClubs,
      
      // Member info
      memberSince,
      daysSinceJoin,
      
      // Content analysis
      mostLikedArticle,
      recentArticles,
      popularPosts,
      popularArticles,
      
      // Chat analysis
      chatAnalysis: {
        totalChats: totalChats.length,
        totalMessagesSent,
        totalMessagesReceived,
        averageMessagesPerChat: totalChats.length > 0 ? Math.round(totalMessagesSent / totalChats.length) : 0
      },
      
      // Performance metrics
      performance: {
        contentCreationRate: daysSinceJoin > 0 ? Math.round((totalPosts + totalArticles) / daysSinceJoin * 7) : 0, // per week
        engagementPerPost: totalPosts > 0 ? Math.round(totalPostLikesCount / totalPosts) : 0,
        engagementPerArticle: totalArticles > 0 ? Math.round(totalArticleLikesCount / totalArticles) : 0
      }
    });
  } catch (error) {
    console.error('Get profile statistics error:', error);
    res.status(500).json({ message: 'Failed to get profile statistics' });
  }
};

// Get suggested friends for the current user
const getSuggestedFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's current friends
    const userFriendships = await prisma.friendship.findMany({
      where: { userId },
      include: { friend: true }
    });
    
    const friendIds = userFriendships.map(fs => fs.friendId);
    
    // Get users who are friends with the user's friends (mutual connections)
    // Exclude users who are already friends with the current user
    const mutualConnections = await prisma.friendship.findMany({
      where: {
        userId: { in: friendIds },
        friendId: { 
          notIn: [...friendIds, userId] // Exclude current friends and self
        }
      },
      include: {
        friend: true
      }
    });
    
    // Count mutual friends for each suggested user
    const suggestedUsersMap = new Map();
    
    mutualConnections.forEach(connection => {
      const suggestedUserId = connection.friendId;
      const suggestedUser = connection.friend;
      
      if (!suggestedUsersMap.has(suggestedUserId)) {
        suggestedUsersMap.set(suggestedUserId, {
          ...suggestedUser,
          mutualFriends: 1
        });
      } else {
        suggestedUsersMap.get(suggestedUserId).mutualFriends++;
      }
    });
    
    // Convert to array and sort by mutual friends count
    let suggestedUsers = Array.from(suggestedUsersMap.values())
      .sort((a, b) => b.mutualFriends - a.mutualFriends)
      .slice(0, 10); // Limit to 10 suggestions
    
    // If we don't have enough suggestions, add some random users (excluding friends)
    if (suggestedUsers.length < 5) {
      const randomUsers = await prisma.user.findMany({
        where: {
          id: { 
            notIn: [...friendIds, userId, ...suggestedUsers.map(u => u.id)]
          }
        },
        take: 5 - suggestedUsers.length,
        orderBy: { createdAt: 'desc' }
      });
      
      const randomSuggestions = randomUsers.map(user => ({
        ...user,
        mutualFriends: 0
      }));
      
      suggestedUsers = [...suggestedUsers, ...randomSuggestions];
    }
    
    // Remove sensitive information
    const cleanSuggestions = suggestedUsers.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      mutualFriends: user.mutualFriends
    }));
    
    res.json({
      success: true,
      message: 'Suggested friends retrieved successfully',
      data: {
        suggestions: cleanSuggestions
      }
    });
  } catch (error) {
    console.error('Get suggested friends error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get suggested friends' 
    });
  }
};

module.exports = {
  getProfileStatistics,
  getSuggestedFriends,
}; 