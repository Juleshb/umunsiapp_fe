import React, { useEffect, useState } from 'react';
import { getArticleComments, addArticleComment } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import CommentItem from './CommentItem';
import socketService from '../services/socketService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
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
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
        Comments
      </h3>
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6 items-start">
          <img src={getUserAvatar(user)} alt={getUserDisplayName(user)} className="w-9 h-9 rounded-full border shadow mt-1" />
          <textarea
            className="flex-1 border rounded px-3 py-2 min-h-[48px] resize-y focus:ring-2 focus:ring-blue-200 transition"
            placeholder="Add a comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={submitting}
            rows={2}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 min-w-[80px]"
            disabled={submitting || !content.trim()}
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}
      {loading ? (
        <div>Loading comments...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500">No comments yet.</div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              // onCommentChange is not needed; real-time updates handle comment changes
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleComments; 