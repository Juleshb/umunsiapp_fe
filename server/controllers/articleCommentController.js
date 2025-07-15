const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all comments for an article (threaded)
const getCommentsForArticle = async (req, res) => {
  try {
    const { id } = req.params; // articleId
    const comments = await prisma.comment.findMany({
      where: { articleId: id, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, username: true, avatar: true } }
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch comments.' });
  }
};

// Add a comment to an article (optionally as a reply)
const addCommentToArticle = async (req, res) => {
  try {
    const { id } = req.params; // articleId
    const { content, parentId } = req.body;
    const userId = req.user.id;
    if (!content) return res.status(400).json({ message: 'Content is required.' });
    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        article: { connect: { id } },
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatar: true } }
          }
        }
      },
    });
    // Fetch all comments for the article (threaded)
    const comments = await prisma.comment.findMany({
      where: { articleId: id, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, username: true, avatar: true } }
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const commentCount = comments.length;
      console.log('Emitting article-comment-updated', { articleId: id, comments, commentCount });
      io.emit('article-comment-updated', { articleId: id, comments, commentCount });
    }
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

// Update a comment (only by author)
const updateComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const { content } = req.body;
    const userId = req.user.id;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.authorId !== userId) return res.status(403).json({ message: 'You can only edit your own comments.' });
    const updated = await prisma.comment.update({ where: { id }, data: { content } });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
};

// Delete a comment (only by author)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // commentId
    const userId = req.user.id;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.authorId !== userId) return res.status(403).json({ message: 'You can only delete your own comments.' });
    await prisma.comment.delete({ where: { id } });
    // Fetch all comments for the article (threaded)
    const comments = await prisma.comment.findMany({
      where: { articleId: comment.articleId, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            replies: {
              include: {
                author: { select: { id: true, username: true, avatar: true } }
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const commentCount = comments.length;
      console.log('Emitting article-comment-updated', { articleId: comment.articleId, comments, commentCount });
      io.emit('article-comment-updated', { articleId: comment.articleId, comments, commentCount });
    }
    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
};

module.exports = {
  getCommentsForArticle,
  addCommentToArticle,
  updateComment,
  deleteComment,
}; 