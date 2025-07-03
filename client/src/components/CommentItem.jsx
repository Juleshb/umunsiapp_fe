import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addArticleComment, updateArticleComment, deleteArticleComment } from '../services/articleService';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
const defaultAvatar = '/default-avatar.png'; // Place a default avatar in public folder

const CommentItem = ({ comment, articleId, onCommentChange, depth = 0 }) => {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await addArticleComment(articleId, { content: replyContent, parentId: comment.id });
      setReplying(false);
      setReplyContent('');
      onCommentChange();
    } catch {}
    setLoading(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await updateArticleComment(comment.id, { content: editContent });
      setEditing(false);
      onCommentChange();
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteArticleComment(comment.id);
      onCommentChange();
    } catch {}
    setLoading(false);
  };

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
      }
      if (user.avatar.startsWith('uploads/')) {
        return `${BASE_URL}/${user.avatar}`;
      }
      if (user.avatar.startsWith('avatars/')) {
        return `${BASE_URL}/uploads/${user.avatar}`;
      }
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${getUserDisplayName(user)}&background=random`;
  };

  return (
    <div className={`flex items-start gap-3 ${depth > 0 ? 'ml-8 border-l-2 border-blue-100 bg-blue-50/30 rounded-lg py-2 px-2' : 'py-4'} group`}> {/* Indent and style replies */}
      {/* Avatar */}
      <img
        src={getUserAvatar(comment.author)}
        alt={getUserDisplayName(comment.author)}
        className="w-9 h-9 rounded-full object-cover border shadow hover:ring-2 hover:ring-blue-400 transition cursor-pointer"
      />
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 hover:underline cursor-pointer">{getUserDisplayName(comment.author)}</span>
          {comment.author?.username && (
            <span className="text-xs text-gray-500">@{comment.author.username}</span>
          )}
          <span className="text-xs text-gray-400 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        {/* Content */}
        {editing ? (
          <form onSubmit={handleEdit} className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded" disabled={loading}>Save</button>
            <button type="button" className="bg-gray-200 px-2 py-1 rounded" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
          </form>
        ) : (
          <div className="mb-2 text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">{comment.content}</div>
        )}
        {/* Actions */}
        <div className="flex gap-3 text-xs text-gray-500 mb-1">
          {user && (
            <button onClick={() => setReplying(r => !r)} className="hover:underline">Reply</button>
          )}
          {user && user.id === comment.authorId && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="hover:underline">Edit</button>
              <button onClick={handleDelete} className="hover:underline text-red-500">Delete</button>
            </>
          )}
        </div>
        {/* Reply form */}
        {replying && (
          <form onSubmit={handleReply} className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              disabled={loading}
              placeholder="Write a reply..."
            />
            <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded" disabled={loading}>Reply</button>
            <button type="button" className="bg-gray-200 px-2 py-1 rounded" onClick={() => setReplying(false)} disabled={loading}>Cancel</button>
          </form>
        )}
        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} articleId={articleId} onCommentChange={onCommentChange} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem; 