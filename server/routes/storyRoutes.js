const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Get all stories (user's own + friends')
router.get('/', authenticateToken, storyController.getAllStories);

// Create a new story (with optional image upload)
router.post('/', authenticateToken, (req, res, next) => {
  // Use multer with optional file upload
  upload.single('story')(req, res, (err) => {
    if (err) {
      // If it's a "no file" error, continue without file
      if (err.code === 'LIMIT_FILE_COUNT' && !req.file) {
        req.file = undefined;
        return next();
      }
      return handleUploadError(err, req, res, next);
    }
    next();
  });
}, storyController.createStory);

// Get story by ID
router.get('/:id', authenticateToken, storyController.getStoryById);

// Update story
router.put('/:id', authenticateToken, (req, res, next) => {
  upload.single('story')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_COUNT' && !req.file) {
        req.file = undefined;
        return next();
      }
      return handleUploadError(err, req, res, next);
    }
    next();
  });
}, storyController.updateStory);

// Delete story
router.delete('/:id', authenticateToken, storyController.deleteStory);

// Like/Unlike story
router.post('/:id/like', authenticateToken, storyController.toggleStoryLike);

// Get story likes
router.get('/:id/likes', authenticateToken, storyController.getStoryLikes);

module.exports = router; 