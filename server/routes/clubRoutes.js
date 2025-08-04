const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createClub,
  getAllClubs,
  getClubById,
  joinClub,
  leaveClub,
  createClubPost,
  getClubPosts,
  getUserClubs,
  getClubMembers,
  getClubJoinRequests,
  handleJoinRequest,
  addMember,
  removeMember
} = require('../controllers/clubController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Club management routes
router.post('/', upload.single('image'), createClub);
router.get('/', getAllClubs);
router.get('/user', getUserClubs);
router.get('/:id', getClubById);
router.post('/:id/join', joinClub);
router.delete('/:id/leave', leaveClub);

// Club posts routes
router.post('/:id/posts', upload.single('image'), createClubPost);
router.get('/:id/posts', getClubPosts);

// Club members management routes
router.get('/:id/members', getClubMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

// Club join requests management routes
router.get('/:id/join-requests', getClubJoinRequests);
router.put('/:id/join-requests/:requestId', handleJoinRequest);

module.exports = router; 