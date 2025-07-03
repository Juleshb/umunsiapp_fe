import React from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

const Post = ({ post }) => {
  // Safety check for post data
  if (!post) {
    return (
      <div className="bg-white rounded-lg shadow mb-6 w-full max-w-xl p-4">
        <p className="text-gray-500 text-center">Post data is missing</p>
      </div>
    );
  }

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

  return (
    <div className="bg-white rounded-lg shadow mb-6 w-full max-w-xl">
      <div className="flex items-center gap-3 px-4 pt-4">
        <img 
          src={getUserAvatar(post.author)} 
          alt={getUserDisplayName(post.author)} 
          className="w-10 h-10 rounded-full border object-cover" 
        />
        <div>
          <div className="font-semibold text-gray-800">{getUserDisplayName(post.author)}</div>
          <div className="text-xs text-gray-400">{formatTime(post.createdAt)}</div>
        </div>
      </div>
      <div className="px-4 py-3 text-gray-800">
        {post.content}
      </div>
      {post.image && (
        <img src={post.image} alt="post" className="w-full max-h-96 object-cover" />
      )}
      <div className="flex items-center gap-6 px-4 py-2 border-t text-gray-500">
        <button className="flex items-center gap-1 hover:text-red-500 transition">
          <HeartIcon className="h-5 w-5" /> Like
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500 transition">
          <ChatBubbleOvalLeftIcon className="h-5 w-5" /> Comment
        </button>
      </div>
    </div>
  );
};

export default Post; 