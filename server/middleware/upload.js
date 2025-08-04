const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'coverImage') {
      uploadPath = path.join(uploadsDir, 'covers');
    } else if (file.fieldname === 'story') {
      uploadPath = path.join(uploadsDir, 'stories');
    } else if (file.fieldname === 'post') {
      uploadPath = path.join(uploadsDir, 'posts');
    } else if (file.fieldname === 'message') {
      uploadPath = path.join(uploadsDir, 'messages');
    } else if (file.fieldname === 'article') {
      uploadPath = path.join(uploadsDir, 'articles');
    } else if (file.fieldname === 'gallery') {
      uploadPath = path.join(uploadsDir, 'articles', 'gallery');
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('/clubs') && req.originalUrl && req.originalUrl.includes('/posts')) {
      uploadPath = path.join(uploadsDir, 'club-posts');
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('/clubs')) {
      uploadPath = path.join(uploadsDir, 'clubs');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Custom middleware for optional story uploads
const optionalStoryUpload = (req, res, next) => {
  upload.single('story')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 10 files.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.'
        });
      }
    }
    
    if (err && err.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // If no file was uploaded, that's okay for stories
    if (err && err.code === 'LIMIT_FILE_COUNT' && req.files === undefined) {
      // No file uploaded, continue without file
      req.file = undefined;
      return next();
    }
    
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }
    
    next();
  });
};

// Specific upload configurations
const uploadConfigs = {
  // Single file uploads
  avatar: upload.single('avatar'),
  coverImage: upload.single('coverImage'),
  story: upload.single('story'),
  storyOptional: optionalStoryUpload,
  post: upload.single('post'),
  message: upload.single('message'),
  article: upload.single('article'),
  
  // Multiple files
  multiple: upload.array('images', 10), // Max 10 images
  
  // Any field
  any: upload.any(),
  
  // Article with coverImage and gallery
  articleFull: upload.fields([
    { name: 'article', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

// Helper function to get file URL
const getFileUrl = (filename, type = '') => {
  if (!filename) return null;
  
  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  const uploadPath = type ? `uploads/${type}` : 'uploads';
  return `${baseUrl}/${uploadPath}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filepath) => {
  if (filepath && fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};

module.exports = {
  upload,
  uploadConfigs,
  handleUploadError,
  getFileUrl,
  deleteFile
}; 