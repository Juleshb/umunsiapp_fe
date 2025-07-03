import React, { useState } from 'react';
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

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

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

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleComment = () => {
    if (comment.trim()) {
      // Add comment logic here
      setComment('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-4 sm:mb-6 w-full max-w-xl overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src={getUserAvatar(post.author)} 
            alt={getUserDisplayName(post.author)} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 object-cover"
          />
          <div>
            <div className="font-semibold text-gray-800 text-sm sm:text-base">
              {getUserDisplayName(post.author)}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
              <span>{formatTime(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    <span className="hidden sm:inline">{post.location}</span>
                    <span className="sm:hidden">Location</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100">
          <EllipsisHorizontalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </button>
      </div>

      {/* Post content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{post.content}</p>
      </div>

      {/* Post image */}
      {post.image && (
        <div className="relative">
          <img 
            src={post.image} 
            alt="post" 
            className="w-full max-h-80 sm:max-h-96 object-cover"
          />
        </div>
      )}

      {/* Post stats */}
      <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-3 sm:gap-4">
            <span>{post._count?.likes || 0} likes</span>
            <span>{post._count?.comments || 0} comments</span>
          </div>
          <span>0 shares</span>
        </div>
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-t border-gray-100">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition ${
            isLiked 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {isLiked ? (
            <HeartSolidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span className="text-xs sm:text-sm font-medium">Like</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <ChatBubbleOvalLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium">Comment</span>
        </button>

        <button className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg text-gray-500 hover:bg-gray-100 transition">
          <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>

        <button 
          onClick={handleSave}
          className={`p-2 sm:p-3 rounded-lg transition ${
            isSaved 
              ? 'text-blue-500 hover:bg-blue-50' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-100 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.firstName} 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
              >
                Post
              </button>
            </div>
          </div>
          
          {/* Sample comments - will be replaced with real comments */}
          <div className="space-y-3">
            <div className="flex gap-2 sm:gap-3">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Alice" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2">
                  <div className="font-medium text-xs sm:text-sm">Alice Johnson</div>
                  <div className="text-xs sm:text-sm">Great post! 👍</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard; 