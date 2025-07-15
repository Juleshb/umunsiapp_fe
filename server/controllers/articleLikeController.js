const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Like an article
const likeArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // articleId
    // Prevent duplicate likes
    const existing = await prisma.articleLike.findUnique({ where: { userId_articleId: { userId, articleId: id } } });
    if (existing) return res.status(400).json({ message: 'Already liked.' });
    await prisma.articleLike.create({ data: { userId, articleId: id } });
    // Get new like count
    const likeCount = await prisma.articleLike.count({ where: { articleId: id } });
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('article-like-updated', { articleId: id, likeCount });
    }
    res.status(201).json({ message: 'Article liked.', likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to like article.' });
  }
};

// Unlike an article
const unlikeArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // articleId
    await prisma.articleLike.delete({ where: { userId_articleId: { userId, articleId: id } } });
    // Get new like count
    const likeCount = await prisma.articleLike.count({ where: { articleId: id } });
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('article-like-updated', { articleId: id, likeCount });
    }
    res.json({ message: 'Article unliked.', likeCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to unlike article.' });
  }
};

// Get likes for an article
const getArticleLikes = async (req, res) => {
  try {
    const { id } = req.params; // articleId
    const likes = await prisma.articleLike.findMany({
      where: { articleId: id },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
    res.json({ count: likes.length, users: likes.map(l => l.user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch likes.' });
  }
};

module.exports = {
  likeArticle,
  unlikeArticle,
  getArticleLikes,
}; 