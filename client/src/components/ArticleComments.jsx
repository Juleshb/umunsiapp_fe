import React, { useEffect, useState } from 'react';
import { getArticleComments, addArticleComment } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, User } from 'lucide-react';
import CommentItem from './CommentItem';
import socketService from '../services/socketService';

const API_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store';
const defaultAvatar = '/default-avatar.png'; // Place a default avatar in public folder

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || 'Unknown User';
};

const getUserAvatar = (user) => {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=Unknown&background=random';
  }
  if (user.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    } else if (user.avatar.length > 0) {
      return `${API_URL}/${user.avatar}`;
    }
  }
  return `https://ui-avatars.com/api/?name=${getUserDisplayName(user)}&background=random`;
};

const ArticleComments = ({ articleId, comments: propComments }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Always fetch comments on mount if not provided
  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      setLoading(true);
      try {
        let initialComments = propComments;
        if (!initialComments) {
          initialComments = await getArticleComments(articleId);
        }
        if (mounted) {
          setComments(initialComments);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load comments.');
          setLoading(false);
        }
      }
    };
    fetchComments();
    return () => { mounted = false; };
  }, [articleId, propComments]);

  useEffect(() => {
    if (!articleId) return;
    // Listen for real-time comment updates
    const handleCommentUpdate = (data) => {
      if (data.articleId === articleId) {
        setComments(data.comments);
      }
    };
    socketService.on('article-comment-updated', handleCommentUpdate);
    return () => {
      socketService.off('article-comment-updated', handleCommentUpdate);
    };
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await addArticleComment(articleId, { content });
      setContent('');
      // Do NOT call fetchComments(); real-time event will update comments
    } catch (err) {
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        {user && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex items-start space-x-3">
              <img
                src={getUserAvatar(user)}
                alt={getUserDisplayName(user)}
                className="w-10 h-10 rounded-full object-cover border border-gray-600"
              />
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {content.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!content.trim() || submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No comments yet</p>
              <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleComments; 