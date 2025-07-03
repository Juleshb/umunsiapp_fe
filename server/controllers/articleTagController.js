const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add tags to an article (author only)
const addTagsToArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // articleId
    const { tags } = req.body; // array of tag names
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ message: 'Article not found.' });
    if (article.authorId !== userId) return res.status(403).json({ message: 'Only the author can add tags.' });
    // Upsert tags and connect
    const tagConnect = await Promise.all(tags.map(async (name) => {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      return { tagId: tag.id };
    }));
    // Remove old tags, add new
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    await prisma.articleTag.createMany({ data: tagConnect.map(tc => ({ articleId: id, tagId: tc.tagId })) });
    res.json({ message: 'Tags updated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update tags.' });
  }
};

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tags.' });
  }
};

// Get articles by tag
const getArticlesByTag = async (req, res) => {
  try {
    const { tag } = req.query;
    if (!tag) return res.status(400).json({ message: 'Tag is required.' });
    const tagObj = await prisma.tag.findUnique({ where: { name: tag } });
    if (!tagObj) return res.json([]);
    const articles = await prisma.article.findMany({
      where: {
        tags: { some: { tagId: tagObj.id } },
      },
      include: { author: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch articles by tag.' });
  }
};

module.exports = {
  addTagsToArticle,
  getAllTags,
  getArticlesByTag,
}; 