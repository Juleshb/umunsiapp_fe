import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon, 
  BookmarkIcon,
  EllipsisHorizontalIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
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
      <div className="bg-white rounded-xl shadow-sm border mb-4 sm:mb-6 w-full max-w-xl p-4">
        <p className="text-gray-500 text-center">Post data is missing</p>
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
              ? 'border-l-4 border-blue-200 bg-white pl-2 pb-2'
              : 'ml-8 border-l-2 border-blue-100 bg-blue-50/60 rounded-2xl py-2 px-2 pb-0'
          } ${replyingTo === c.id ? 'ring-2 ring-blue-400' : ''}`}
          style={{ marginBottom: depth === 0 ? '0.5rem' : '0' }}
        >
          {/* Comment Content */}
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
                {/* Show Replies toggle */}
                {c.replies && c.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(c.id)}
                    className="hover:underline text-blue-600 font-medium"
                  >
                    {showReplies[c.id] ? 'Hide Replies' : `Show Replies (${c.replies.length})`}
                  </button>
                )}
              </div>
              {/* Reply input */}
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
        className="bg-white rounded-2xl shadow-md border mb-6 w-full max-w-xl overflow-hidden hover:shadow-lg transition"
      >
        {/* Post header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-2">
          <div className="relative">
            <img
              src={getUserAvatar(post.author)}
              alt={getUserDisplayName(post.author)}
              className="w-12 h-12 rounded-full border object-cover"
            />
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base truncate">{getUserDisplayName(post.author)}</span>
              <span className="text-xs text-gray-400">&bull; {formatTime(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {post.author?.location && (
                <>
                  <MapPinIcon className="h-4 w-4 inline-block mr-1 text-gray-400" />
                  <span className="truncate">{post.author.location}</span>
                </>
              )}
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <EllipsisHorizontalIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        {/* Post content */}
        <div className="px-5 pb-3 text-gray-800 text-base whitespace-pre-line">
          {post.content}
        </div>
        {/* Image grid (if images) */}
        {post.images && post.images.length > 0 ? (
          <div className="px-5 pb-3">
            <div className={`grid gap-2 ${post.images.length === 1 ? '' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {post.images.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`post-img-${idx}`}
                  className="rounded-xl object-cover w-full h-48"
                  style={{ objectFit: 'cover' }}
                />
              ))}
              {post.images.length > 4 && (
                <div className="flex items-center justify-center rounded-xl bg-gray-200 text-gray-700 text-lg font-semibold">
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          </div>
        ) : post.image ? (
          <div className="px-5 pb-3">
            <img src={post.image} alt="post" className="w-full max-h-96 object-cover rounded-xl mx-auto" />
          </div>
        ) : null}
        {/* Post actions row */}
        <div className="flex items-center justify-between px-5 py-3 border-t text-gray-500">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition ${isLiked ? 'text-red-500' : ''}`}
            >
              {isLiked ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />} {likeCount}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-blue-500 transition"
            >
              <ChatBubbleOvalLeftIcon className="h-5 w-5" /> {commentCount}
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition">
              <ShareIcon className="h-5 w-5" />
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 hover:text-blue-500 transition">
              <BookmarkIcon className={`h-5 w-5 ${isSaved ? 'text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
        {/* Likes and comments preview */}
        <div className="px-5 pb-3 text-sm text-gray-600">
          <span className="font-semibold">{likeCount} likes</span>
          <span className="mx-2">&middot;</span>
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(true)}>{commentCount} Comments</span>
        </div>
        {/* Comment input and preview */}
        <div className="px-5 pb-5">
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
              placeholder="Add a comment..."
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
          {/* Preview latest 2 comments */}
          {commentsLoading ? (
            <div>Loading comments...</div>
          ) : commentsError ? (
            <div className="text-red-500">{commentsError}</div>
          ) : previewComments.length === 0 ? null : (
            <div className="space-y-2">
              {renderComments(previewComments)}
            </div>
          )}
          {/* View all comments link */}
          {commentCount > 2 && (
            <button
              onClick={handleOpenModal}
              className="mt-2 text-blue-600 hover:underline text-sm font-medium"
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