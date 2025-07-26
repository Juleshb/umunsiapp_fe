const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
    body('isStudent').optional().isBoolean().withMessage('isStudent must be a boolean'),
    validate
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  update: [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('isStudent').optional().isBoolean().withMessage('isStudent must be a boolean'),
    validate
  ]
};

// Post validation rules
const postValidation = {
  create: [
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Post content must be 1-2000 characters'),
    body('location').optional().trim().isLength({ max: 100 }),
    body('isPublic').optional().isBoolean(),
    validate
  ],
  update: [
    body('content').optional().trim().isLength({ min: 1, max: 2000 }),
    body('location').optional().trim().isLength({ max: 100 }),
    body('isPublic').optional().isBoolean(),
    validate
  ]
};

// Comment validation rules
const commentValidation = {
  create: [
    body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
    validate
  ]
};

// Story validation rules
const storyValidation = {
  create: [
    body('content').optional().trim().isLength({ max: 200 }),
    validate
  ]
};

// Message validation rules
const messageValidation = {
  send: [
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    validate
  ]
};

// Friend request validation rules
const friendRequestValidation = {
  send: [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    validate
  ]
};

// Follow validation rules
const followValidation = {
  follow: [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    validate
  ]
};

// ID validation
const idValidation = {
  userId: [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    validate
  ],
  postId: [
    param('postId').notEmpty().withMessage('Valid post ID is required'),
    validate
  ],
  commentId: [
    param('commentId').notEmpty().withMessage('Valid comment ID is required'),
    validate
  ],
  storyId: [
    param('storyId').isUUID().withMessage('Valid story ID is required'),
    validate
  ]
};

module.exports = {
  validate,
  userValidation,
  postValidation,
  commentValidation,
  storyValidation,
  messageValidation,
  friendRequestValidation,
  followValidation,
  idValidation
}; 