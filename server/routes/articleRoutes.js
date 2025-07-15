const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const articleCommentController = require('../controllers/articleCommentController');
const articleLikeController = require('../controllers/articleLikeController');
const articleTagController = require('../controllers/articleTagController');
const articleGalleryController = require('../controllers/articleGalleryController');

// Create article (premium users only, with image upload)
router.post('/', uploadConfigs.articleFull, handleUploadError, authenticateToken, articleController.createArticle);

// Get all articles
router.get('/', articleController.getAllArticles);

// Get article by ID
router.get('/:id', articleController.getArticleById);

// Update article (premium author only, with image upload)
router.put('/:id', uploadConfigs.articleFull, handleUploadError, authenticateToken, articleController.updateArticle);

// Delete article (premium author only)
router.delete('/:id', authenticateToken, articleController.deleteArticle);

// Article comments (threaded)
router.get('/:id/comments', articleCommentController.getCommentsForArticle);
router.post('/:id/comments', authenticateToken, articleCommentController.addCommentToArticle);
router.put('/comments/:id', authenticateToken, articleCommentController.updateComment);
router.delete('/comments/:id', authenticateToken, articleCommentController.deleteComment);

// Article likes
router.post('/:id/like', authenticateToken, articleLikeController.likeArticle);
router.delete('/:id/like', authenticateToken, articleLikeController.unlikeArticle);
router.get('/:id/likes', articleLikeController.getArticleLikes);

// Article tags
router.post('/:id/tags', authenticateToken, articleTagController.addTagsToArticle);
router.get('/tags', articleTagController.getAllTags);
router.get('/', articleTagController.getArticlesByTag); // supports ?tag=tagName

// Article gallery
router.post('/:id/images', authenticateToken, uploadConfigs.articleFull, handleUploadError, articleGalleryController.uploadImagesToArticle);
router.delete('/images/:imageId', authenticateToken, articleGalleryController.deleteArticleImage);

// Article sharing
router.post('/:id/share', authenticateToken, articleController.shareArticle);

module.exports = router; 