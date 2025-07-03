import React, { useState } from 'react';
import { PhotoIcon, VideoCameraIcon, FaceSmileIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/postService';
import toast from 'react-hot-toast';

const QuickPost = ({ onCreatePost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const postData = {
        content: content.trim(),
      };

      const response = await postService.createPost(postData);
      
      if (response.success) {
        toast.success('Post created successfully!');
        onCreatePost(response.data);
        setContent('');
      } else {
        toast.error(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 w-full max-w-xl">
      <div className="flex items-start gap-2 sm:gap-3">
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.firstName} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 object-cover"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200">
            <span className="text-white font-bold text-sm">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-2 sm:p-3 border-0 resize-none focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
              rows={3}
              disabled={loading}
            />
          </form>
          
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                type="button"
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                disabled={loading}
              >
                <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Photo</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                disabled={loading}
              >
                <VideoCameraIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Video</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                disabled={loading}
              >
                <FaceSmileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Feeling</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                disabled={loading}
              >
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Location</span>
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition text-sm"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPost; 