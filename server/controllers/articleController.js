const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getFileUrl } = require('../middleware/upload');

// Create a new article (premium users only)
const createArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan !== 'PREMIUM') {
      return res.status(403).json({ message: 'Only premium users can create articles.' });
    }
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    // Handle files from req.files
    let imageUrl = null;
    let coverImageUrl = null;
    if (req.files && req.files['article'] && req.files['article'][0]) {
      imageUrl = getFileUrl(req.files['article'][0].filename, 'articles');
    }
    if (req.files && req.files['coverImage'] && req.files['coverImage'][0]) {
      coverImageUrl = getFileUrl(req.files['coverImage'][0].filename, 'covers');
    }
    if (req.files && req.files['gallery']) {
      // Save gallery images as ArticleImage records with relative path
      const galleryFiles = req.files['gallery'];
      // Create the article first, then create images
      const article = await prisma.article.create({
        data: {
          title,
          content,
          image: imageUrl,
          author: { connect: { id: userId } },
        },
        include: { author: true },
      });
      // Save ArticleImage records
      const galleryImages = await Promise.all(
        galleryFiles.map(f =>
          prisma.articleImage.create({
            data: {
              url: `gallery/${f.filename}`,
              article: { connect: { id: article.id } },
            },
          })
        )
      );
      const gallery = galleryImages.map(img => getFileUrl(img.url, 'articles'));
      return res.status(201).json({ ...article, coverImage: coverImageUrl, gallery });
    }
    // If no gallery, create article as before
    const article = await prisma.article.create({
      data: {
        title,
        content,
        image: imageUrl,
        author: { connect: { id: userId } },
      },
      include: { author: true },
    });
    res.status(201).json({ ...article, coverImage: coverImageUrl, gallery: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create article.' });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        articleTags: { include: { tag: true } },
      },
    });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch articles.' });
  }
};

// Get article by ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        articleTags: { include: { tag: true } },
        images: true,
      },
    });
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    // Get like and comment counts
    const [likeCount, commentCount] = await Promise.all([
      prisma.articleLike.count({ where: { articleId: id } }),
      prisma.comment.count({ where: { articleId: id } }),
    ]);
    // Map images to include full URLs
    const gallery = article.images.map(img => img.url.startsWith('http') ? img.url : getFileUrl(img.url, 'articles'));
    res.json({ ...article, likeCount, commentCount, gallery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch article.' });
  }
};

// Update an article (premium author only)
const updateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    if (article.authorId !== userId) {
      return res.status(403).json({ message: 'You can only edit your own articles.' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan !== 'PREMIUM') {
      return res.status(403).json({ message: 'Only premium users can edit articles.' });
    }
    const { title, content } = req.body;
    let imageUrl = article.image;
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename, 'articles');
    }
    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title || article.title,
        content: content || article.content,
        image: imageUrl,
      },
      include: { author: true },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update article.' });
  }
};

// Delete an article (premium author only)
const deleteArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    if (article.authorId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own articles.' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan !== 'PREMIUM') {
      return res.status(403).json({ message: 'Only premium users can delete articles.' });
    }
    await prisma.article.delete({ where: { id } });
    res.json({ message: 'Article deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete article.' });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
}; 