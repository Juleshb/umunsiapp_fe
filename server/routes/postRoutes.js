const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, checkOwnership } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const { postValidation, commentValidation, idValidation } = require('../utils/validation');

// Create post
router.post('/', authenticateToken, uploadConfigs.post, handleUploadError, postValidation.create, postController.createPost);
// Get all posts (feed)
router.get('/', authenticateToken, postController.getAllPosts);
// Get post by ID
router.get('/:postId', authenticateToken, idValidation.postId, postController.getPostById);
// Update post
router.put('/:postId', authenticateToken, checkOwnership('post'), uploadConfigs.post, handleUploadError, postValidation.update, postController.updatePost);
// Delete post
router.delete('/:postId', authenticateToken, checkOwnership('post'), postController.deletePost);

// Like/unlike post (toggle)
router.post('/:postId/like', authenticateToken, idValidation.postId, postController.toggleLike);
// Share post
router.post('/:postId/share', authenticateToken, idValidation.postId, postController.sharePost);

// Comments
router.post('/:postId/comments', authenticateToken, idValidation.postId, commentValidation.create, postController.addComment);
router.get('/:postId/comments', authenticateToken, idValidation.postId, postController.getComments);
router.delete('/:postId/comments/:commentId', authenticateToken, checkOwnership('comment'), idValidation.postId, idValidation.commentId, postController.deleteComment);

module.exports = router; 