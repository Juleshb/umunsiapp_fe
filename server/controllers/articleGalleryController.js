const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getFileUrl } = require('../middleware/upload');

// Upload images to an article (author only, multiple files)
const uploadImagesToArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // articleId
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ message: 'Article not found.' });
    if (article.authorId !== userId) return res.status(403).json({ message: 'Only the author can upload images.' });
    const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
    if (galleryFiles.length === 0) return res.status(400).json({ message: 'No images uploaded.' });
    const images = await Promise.all(galleryFiles.map(async (file) => {
      const url = getFileUrl(file.filename, 'articles');
      return prisma.articleImage.create({ data: { url, articleId: id } });
    }));
    res.status(201).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload images.' });
  }
};

// Delete an image from an article (author only)
const deleteArticleImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageId } = req.params;
    const image = await prisma.articleImage.findUnique({ where: { id: imageId }, include: { article: true } });
    if (!image) return res.status(404).json({ message: 'Image not found.' });
    if (image.article.authorId !== userId) return res.status(403).json({ message: 'Only the author can delete images.' });
    await prisma.articleImage.delete({ where: { id: imageId } });
    res.json({ message: 'Image deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete image.' });
  }
};

module.exports = {
  uploadImagesToArticle,
  deleteArticleImage,
}; 