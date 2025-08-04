import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark,
  MoreHorizontal,
  MapPin,
  Send
} from 'lucide-react';
import { Heart as HeartSolid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import postService from '../services/postService';
import PostModal from './PostModal';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Show/hide replies state
  const [showReplies, setShowReplies] = useState({});

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Fetch comments for this post
  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await postService.getComments(post.id);
      // Always use the array from res.data.comments if present
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

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  useEffect(() => {
    // Listen for real-time like/comment updates for this post
    const handleLikeUpdate = (data) => {
      if (data.postId === post.id) {
        setLikeCount(data.likeCount);
        // Update isLiked state if the data includes user's like status
        if (data.userId === user?.id && data.isLiked !== undefined) {
          setIsLiked(data.isLiked);
        }
      }
    };
    const handleCommentUpdate = (data) => {
      if (data.postId === post.id) {
        setCommentCount(data.commentCount);
        // Optionally update the comment list in real time
        fetchComments();
      }
    };
    socketService.on('post-like-updated', handleLikeUpdate);
    socketService.on('post-comment-updated', handleCommentUpdate);
    return () => {
      socketService.off('post-like-updated', handleLikeUpdate);
      socketService.off('post-comment-updated', handleCommentUpdate);
    };
  }, [post.id]);

  // Debug: Log the post data structure
  console.log('PostCard received post:', post);

  // Safety check for post data
  if (!post) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6 w-full p-6">
        <p className="text-gray-400 text-center">Post data is missing</p>
      </div>
    );
  }

  // Format the time
  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get user display name
  const getUserDisplayName = (postUser) => {
    if (!postUser) return 'Unknown User';
    if (postUser.firstName && postUser.lastName) {
      return `${postUser.firstName} ${postUser.lastName}`;
    }
    return postUser.username || 'Unknown User';
  };

  // Get user avatar
  const getUserAvatar = (postUser) => {
    if (!postUser) {
      return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    }
    if (postUser.avatar) {
      return postUser.avatar;
    }
    return `https://ui-avatars.com/api/?name=${getUserDisplayName(postUser)}&background=random`;
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await postService.toggleLike(post.id);
      setIsLiked(res.isLiked !== undefined ? res.isLiked : !isLiked);
      // Optionally update likeCount if returned
      if (typeof res.likeCount === 'number') setLikeCount(res.likeCount);
    } catch (err) {
      // Optionally show error
      console.error('Failed to like post', err);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleComment = async () => {
    if (!comment.trim() || !user) return;
    try {
      await postService.addComment(post.id, comment.trim());
      setComment('');
      // Do not call fetchComments(); real-time event will update comments
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

  // Recursive comment rendering
  const renderComments = (commentsArr, depth = 0) => (
    <div>
      {commentsArr.map((c) => (
        <div
          key={c.id}
          className={`${
            depth === 0
              ? 'border-l-4 border-blue-500/30 bg-gray-700/50 pl-3 pb-3'
              : 'ml-8 border-l-2 border-blue-400/20 bg-gray-700/30 rounded-xl py-2 px-3 pb-0'
          } ${replyingTo === c.id ? 'ring-2 ring-blue-500/50' : ''}`}
          style={{ marginBottom: depth === 0 ? '0.5rem' : '0' }}
        >
          {/* Comment Content */}
          <div className={`flex gap-3 ${depth === 0 ? 'shadow-sm rounded-xl p-3 bg-gray-700/50 hover:bg-gray-700/70 transition' : 'shadow rounded-xl p-3 bg-gray-700/30 hover:bg-gray-700/50 transition'}`}>
            <img
              src={c.author?.avatar || 'https://ui-avatars.com/api/?name=' + (c.author?.username || 'User') + '&background=random'}
              alt={c.author?.username || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-600 shadow"
            />
            <div className="flex-1">
              <div className="bg-gray-600/50 rounded-xl px-3 py-2">
                <div className="font-semibold text-sm text-white">{c.author?.firstName || c.author?.username || 'User'}</div>
                <div className="text-sm text-gray-300">{c.content}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <button onClick={() => { setReplyingTo(c.id); setReplyContent(''); }} className="hover:text-blue-400 font-medium transition-colors">Reply</button>
                {/* Show Replies toggle */}
                {c.replies && c.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(c.id)}
                    className="hover:text-blue-400 text-blue-400 font-medium transition-colors"
                  >
                    {showReplies[c.id] ? 'Hide Replies' : `Show Replies (${c.replies.length})`}
                  </button>
                )}
              </div>
              {/* Reply input */}
              {replyingTo === c.id && (
                <form
                  onSubmit={e => { e.preventDefault(); handleReply(c.id); }}
                  className="flex items-center gap-2 mt-2 bg-gray-600/30 rounded-xl px-3 py-2 shadow-sm border border-gray-600"
                >
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.username || 'U')}
                    alt={user?.username || 'U'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <input
                    type="text"
                    className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-sm text-white placeholder-gray-400"
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300 px-2 transition-colors"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}
              {/* Render replies recursively if toggled, directly under parent */}
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

  // Utility: build nested comment tree from flat array
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

  const [modalOpen, setModalOpen] = useState(false);

  // Add a handler to open the modal only from a link/button
  const handleOpenModal = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  // Show only the latest 2 comments in the feed preview
  const previewComments = buildCommentTree(comments).slice(0, 2);

  return (
    <>
      <div
        className={`bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border mb-4 lg:mb-6 w-full overflow-hidden transition-all duration-200 backdrop-blur-sm ${
          isLiked 
            ? 'border-red-500/60 hover:border-red-400/60 lg:border-red-500 lg:hover:border-red-400 shadow-lg shadow-red-500/20' 
            : 'border-gray-600/60 hover:border-gray-500/60 lg:border-gray-700 lg:hover:border-gray-600'
        }`}
      >
        {/* Post header */}
        <div className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 pt-4 lg:pt-6 pb-2 lg:pb-3">
          <div className="relative">
            <img
              src={getUserAvatar(post.author)}
              alt={getUserDisplayName(post.author)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-gray-600 object-cover"
            />
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 lg:gap-2">
              <span className="font-semibold text-white text-sm lg:text-base truncate">{getUserDisplayName(post.author)}</span>
              <span className="text-xs text-gray-400">&bull; {formatTime(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 text-xs text-gray-400">
              {post.author?.location && (
                <>
                  <MapPin className="h-3 w-3 inline-block mr-1 text-gray-400" />
                  <span className="truncate">{post.author.location}</span>
                </>
              )}
            </div>
          </div>
          <button className="p-1.5 lg:p-2 rounded-full hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
          </button>
        </div>
        {/* Post content */}
        <div className="px-4 lg:px-6 pb-3 lg:pb-4 text-gray-300 text-sm lg:text-base whitespace-pre-line leading-relaxed">
          {post.content}
        </div>
        {/* Image grid (if images) */}
        {post.images && post.images.length > 0 ? (
          <div className="px-4 lg:px-6 pb-3 lg:pb-4">
            <div className={`grid gap-1 lg:gap-2 ${post.images.length === 1 ? '' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {post.images.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`post-img-${idx}`}
                  className="rounded-lg lg:rounded-xl object-cover w-full h-32 lg:h-48 border border-gray-600"
                  style={{ objectFit: 'cover' }}
                />
              ))}
              {post.images.length > 4 && (
                <div className="flex items-center justify-center rounded-lg lg:rounded-xl bg-gray-700 text-gray-300 text-sm lg:text-lg font-semibold border border-gray-600">
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          </div>
        ) : post.image ? (
          <div className="px-4 lg:px-6 pb-3 lg:pb-4">
            <img src={post.image} alt="post" className="w-full max-h-64 lg:max-h-96 object-cover rounded-lg lg:rounded-xl mx-auto border border-gray-600" />
          </div>
        ) : null}
        {/* Post actions row */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-600/60 lg:border-gray-700 text-gray-400">
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 lg:gap-2 transition-all duration-200 active:scale-95 ${
                isLiked 
                  ? 'text-red-400 hover:text-red-300 hover:scale-110' 
                  : 'hover:text-red-400 hover:scale-105'
              }`}
            >
              {isLiked ? <HeartSolid className="h-4 w-4 lg:h-5 lg:w-5 fill-current" /> : <Heart className="h-4 w-4 lg:h-5 lg:w-5" />} 
              <span className="text-xs lg:text-sm font-medium">{likeCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 lg:gap-2 hover:text-blue-400 transition-colors"
            >
              <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" /> 
              <span className="text-xs lg:text-sm font-medium">{commentCount}</span>
            </button>
            <button className="flex items-center gap-1.5 lg:gap-2 hover:text-blue-400 transition-colors">
              <Share className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 lg:gap-2 hover:text-blue-400 transition-colors">
              <Bookmark className={`h-4 w-4 lg:h-5 lg:w-5 ${isSaved ? 'text-blue-400 fill-current' : ''}`} />
            </button>
          </div>
        </div>
        {/* Likes and comments preview */}
        <div className="px-4 lg:px-6 pb-3 lg:pb-4 text-xs lg:text-sm text-gray-400">
          <span className="font-semibold text-white">{likeCount} likes</span>
          <span className="mx-1 lg:mx-2">&middot;</span>
          <span className="cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setShowComments(true)}>{commentCount} Comments</span>
        </div>
        {/* Comment input and preview */}
        <div className="px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-600"
              />
            ) : (
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs lg:text-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 lg:px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs lg:text-sm text-white placeholder-gray-400"
              onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim()}
              className="p-1.5 lg:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-3 w-3 lg:h-4 lg:w-4" />
            </button>
          </div>
          {/* Preview latest 2 comments */}
          {commentsLoading ? (
            <div className="text-gray-400 text-sm">Loading comments...</div>
          ) : commentsError ? (
            <div className="text-red-400 text-sm">{commentsError}</div>
          ) : previewComments.length === 0 ? null : (
            <div className="space-y-2">
              {renderComments(previewComments)}
            </div>
          )}
          {/* View all comments link */}
          {commentCount > 2 && (
            <button
              onClick={handleOpenModal}
              className="mt-3 text-blue-400 hover:text-blue-300 text-xs lg:text-sm font-medium transition-colors"
            >
              View all {commentCount} comments
            </button>
          )}
        </div>
      </div>
      {/* Post details modal */}
      {modalOpen && (
        <PostModal post={post} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

export default PostCard; 