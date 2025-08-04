import React, { useState } from 'react';
import { Image, Video, Smile, MapPin, Send, Sparkles } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 lg:p-6 mb-4 lg:mb-6 w-full hover:border-gray-500/60 lg:hover:border-gray-600 transition-colors backdrop-blur-sm">
      <div className="flex items-start gap-3 lg:gap-4">
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.firstName} 
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-gray-600 object-cover"
          />
        ) : (
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-600">
            <span className="text-white font-bold text-base lg:text-lg">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 lg:gap-2 mb-2 lg:mb-3">
            <div className="p-1 lg:p-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-white">What's on your mind?</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or experiences with your network..."
              className="w-full p-3 lg:p-4 bg-gray-700 border border-gray-600 rounded-lg lg:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 text-sm lg:text-base leading-relaxed"
              rows={3}
              disabled={loading}
            />
          </form>
          
          <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-600/60 lg:border-gray-700">
            <div className="flex items-center gap-2 lg:gap-3">
              <button 
                type="button"
                className="flex items-center gap-1.5 lg:gap-2 p-2 lg:p-2.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-green-400 group"
                disabled={loading}
              >
                <Image className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Photo</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1.5 lg:gap-2 p-2 lg:p-2.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-purple-400 group"
                disabled={loading}
              >
                <Video className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Video</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1.5 lg:gap-2 p-2 lg:p-2.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-yellow-400 group"
                disabled={loading}
              >
                <Smile className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Feeling</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-1.5 lg:gap-2 p-2 lg:p-2.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-400 group"
                disabled={loading}
              >
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-medium hidden sm:block">Location</span>
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 text-sm lg:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 lg:h-4 lg:w-4" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPost; 