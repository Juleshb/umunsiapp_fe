import React, { useState, useEffect } from 'react';
import { XMarkIcon, HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import socketService from '../services/socketService';
import postService from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

function buildCommentTree(flatComments) {
  const idToComment = {};
  const rootComments = [];
  flatComments.forEach(comment => {
    idToComment[comment.id] = { ...comment, replies: [] };
  });
  flatComments.forEach(comment => {
    if (comment.parentId && idToComment[comment.parentId]) {
      idToComment[comment.parentId].replies.push(idToComment[comment.id]);
    } else {
      rootComments.push(idToComment[comment.id]);
    }
  });
  return rootComments;
}

const PostModal = ({ post, onClose }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    fetchComments();
    // Listen for real-time like/comment updates for this post
    const handleLikeUpdate = (data) => {
      if (data.postId === post.id) {
        setLikeCount(data.likeCount);
      }
    };
    const handleCommentUpdate = (data) => {
      if (data.postId === post.id) {
        setCommentCount(data.commentCount);
        setComments(data.comments || []);
      }
    };
    socketService.on('post-like-updated', handleLikeUpdate);
    socketService.on('post-comment-updated', handleCommentUpdate);
    return () => {
      socketService.off('post-like-updated', handleLikeUpdate);
      socketService.off('post-comment-updated', handleCommentUpdate);
    };
    // eslint-disable-next-line
  }, [post.id]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await postService.getComments(post.id);
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.comments)) arr = res.comments;
      else if (Array.isArray(res?.data?.comments)) arr = res.data.comments;
      setComments(arr);
    } catch (err) {
      setCommentsError('Failed to load comments.');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await postService.toggleLike(post.id);
      setIsLiked(res.isLiked !== undefined ? res.isLiked : !isLiked);
      if (typeof res.likeCount === 'number') setLikeCount(res.likeCount);
    } catch (err) {
      // Optionally show error
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !user) return;
    try {
      await postService.addComment(post.id, comment.trim());
      setComment('');
      // Real-time event will update comments
    } catch (err) {
      setCommentsError('Failed to add comment.');
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim() || !user) return;
    try {
      await postService.addComment(post.id, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
      // Real-time event will update comments
    } catch (err) {
      setCommentsError('Failed to add reply.');
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Recursive comment rendering
  const renderComments = (commentsArr, depth = 0) => (
    <div>
      {commentsArr.map((c) => (
        <div
          key={c.id}
          className={`$ {
            depth === 0
              ? 'border-l-4 border-blue-200 bg-white pl-2 pb-2'
              : 'ml-8 border-l-2 border-blue-100 bg-blue-50/60 rounded-2xl py-2 px-2 pb-0'
          } ${replyingTo === c.id ? 'ring-2 ring-blue-400' : ''}`}
          style={{ marginBottom: depth === 0 ? '0.5rem' : '0' }}
        >
          <div className={`flex gap-2 ${depth === 0 ? 'shadow-sm rounded-2xl p-3 bg-white hover:shadow-md transition' : 'shadow rounded-2xl p-3 bg-blue-50/60 hover:shadow-md transition'}`}>
            <img
              src={c.author?.avatar || 'https://ui-avatars.com/api/?name=' + (c.author?.username || 'User') + '&background=random'}
              alt={c.author?.username || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
            />
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl px-3 py-2">
                <div className="font-bold text-base text-gray-800">{c.author?.firstName || c.author?.username || 'User'}</div>
                <div className="text-sm text-gray-700">{c.content}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                <button onClick={() => { setReplyingTo(c.id); setReplyContent(''); }} className="hover:underline font-medium">Reply</button>
                {c.replies && c.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(c.id)}
                    className="hover:underline text-blue-600 font-medium"
                  >
                    {showReplies[c.id] ? 'Hide Replies' : `Show Replies (${c.replies.length})`}
                  </button>
                )}
              </div>
              {replyingTo === c.id && (
                <form
                  onSubmit={e => { e.preventDefault(); handleReply(c.id); }}
                  className="flex items-center gap-2 mt-2 bg-gray-50 rounded-xl px-3 py-2 shadow-sm border border-gray-200"
                >
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.username || 'U')}
                    alt={user?.username || 'U'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <input
                    type="text"
                    className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-sm"
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold hover:bg-blue-700 transition"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 px-2"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}
              {c.replies && c.replies.length > 0 && showReplies[c.id] && (
                <div className="mt-1">
                  {renderComments(c.replies, depth + 1)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Post header helpers
  const getUserDisplayName = (postUser) => {
    if (!postUser) return 'Unknown User';
    if (postUser.firstName && postUser.lastName) {
      return `${postUser.firstName} ${postUser.lastName}`;
    }
    return postUser.username || 'Unknown User';
  };
  const getUserAvatar = (postUser) => {
    if (!postUser) {
      return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    }
    if (postUser.avatar) {
      return postUser.avatar;
    }
    return `https://ui-avatars.com/api/?name=${getUserDisplayName(postUser)}&background=random`;
  };
  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-2 my-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full bg-gray-100"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        {/* Post details */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getUserAvatar(post.author)}
              alt={getUserDisplayName(post.author)}
              className="w-10 h-10 rounded-full border object-cover"
            />
            <div>
              <div className="font-semibold text-gray-800 text-base">
                {getUserDisplayName(post.author)}
              </div>
              <div className="text-xs text-gray-400">{formatTime(post.createdAt)}</div>
            </div>
          </div>
          <div className="text-gray-800 text-base mb-2">
            {post.content}
          </div>
          {post.image && (
            <img src={post.image} alt="post" className="w-full max-h-96 object-cover rounded-xl mx-auto mb-2" />
          )}
          {/* Post actions row */}
          <div className="flex items-center gap-6 py-2 border-t border-b text-gray-500 mb-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition ${isLiked ? 'text-red-500' : ''}`}
            >
              <HeartIcon className="h-5 w-5" /> {likeCount} Likes
            </button>
            <span className="flex items-center gap-1"><ChatBubbleOvalLeftIcon className="h-5 w-5" /> {commentCount} Comments</span>
            <span className="flex items-center gap-1"><ShareIcon className="h-5 w-5" /> Share</span>
            <span className="flex items-center gap-1"><BookmarkIcon className="h-5 w-5" /> Save</span>
          </div>
        </div>
        {/* Comment input */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Post
            </button>
          </div>
        </div>
        {/* All comments and replies */}
        <div className="px-6 pb-6">
          {commentsLoading ? (
            <div>Loading comments...</div>
          ) : commentsError ? (
            <div className="text-red-500">{commentsError}</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500">No comments yet.</div>
          ) : (
            renderComments(buildCommentTree(comments))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostModal; 