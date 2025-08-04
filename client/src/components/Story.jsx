import React, { useState, useEffect } from 'react';
import { Plus, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import storyService from '../services/storyService';
import toast from 'react-hot-toast';

const Story = ({ story, isCreateCard, isYourStory, user }) => {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch initial like status and count
  useEffect(() => {
    if (story?.slides && story.slides.length > 0 && !isCreateCard) {
      // Use the first slide's storyId for API calls
      const storyId = story.slides[0].storyId;
      if (storyId) {
        fetchStoryLikes(storyId);
      }
    }
  }, [story?.slides, isCreateCard]);

  const fetchStoryLikes = async (storyId) => {
    if (!storyId) return;
    
    try {
      const response = await storyService.getStoryLikes(storyId);
      if (response.success) {
        setIsLiked(response.data.userLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Failed to fetch story likes:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser || isLiking || !story?.slides || story.slides.length === 0) return;

    // Use the first slide's storyId for API calls
    const storyId = story.slides[0].storyId;
    if (!storyId) return;

    setIsLiking(true);
    try {
      const response = await storyService.toggleStoryLike(storyId);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
        
        if (response.data.liked) {
          toast.success('Story liked!');
        } else {
          toast.success('Story unliked!');
        }
      }
    } catch (error) {
      console.error('Failed to toggle story like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  if (isCreateCard) {
    return (
      <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20">
        <div className="relative w-full h-24 lg:h-32 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center shadow-lg overflow-hidden border-2 border-gray-600 hover:border-blue-500 transition-all duration-200 group-hover:shadow-blue-500/20">
          <img
            src={user?.avatar || 'https://ui-avatars.com/api/?name=U'}
            alt={user?.firstName}
            className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50"
          />
          <div className="absolute bottom-1.5 lg:bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full p-1 lg:p-1.5 shadow-lg border border-gray-600">
            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Plus className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-300 mt-1 text-center">Create story</span>
      </div>
    );
  }

  if (isYourStory) {
    // Use the last slide's image as background if available
    const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
    return (
      <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20">
        <div className="relative w-full h-24 lg:h-32 rounded-xl shadow-lg overflow-hidden border-2 border-blue-500 hover:border-blue-400 transition-all duration-200 group-hover:shadow-blue-500/20">
          <img
            src={lastImage}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute top-1.5 lg:top-2 left-1.5 lg:left-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-blue-500 bg-gray-800 shadow-lg">
            <img
              src={story.user.avatar}
              alt={story.user.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {/* New story indicator */}
          {story.isNew && (
            <div className="absolute top-1.5 lg:top-2 right-1.5 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
          )}
          {/* Like button for your own story */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`absolute bottom-1.5 lg:bottom-2 right-1.5 lg:right-2 p-1 lg:p-1.5 rounded-full shadow-lg transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <Heart className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        <span className="text-xs font-medium text-gray-300 mt-1 text-center">Your story</span>
      </div>
    );
  }

  // Other stories
  // Use the last slide's image as background if available
  const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3 cursor-pointer group w-16 lg:w-20">
      <div className={`relative w-full h-24 lg:h-32 rounded-xl shadow-lg overflow-hidden transition-all duration-200 group-hover:shadow-gray-500/20 ${
        isLiked 
          ? 'border-2 border-red-500 hover:border-red-400' 
          : 'border-2 border-gray-600 hover:border-gray-500'
      }`}>
        <img
          src={lastImage}
          alt={story.user.name}
          className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute top-1.5 lg:top-2 left-1.5 lg:left-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-blue-500 bg-gray-800 shadow-lg">
          <img
            src={story.user.avatar}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        {/* New story indicator */}
        {story.isNew && (
          <div className="absolute top-1.5 lg:top-2 right-1.5 lg:right-2 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
        )}
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`absolute bottom-1.5 lg:bottom-2 right-1.5 lg:right-2 p-1 lg:p-1.5 rounded-full shadow-lg transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
        >
          <Heart className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        {/* Multiple stories indicator */}
        {story.hasMultipleStories && (
          <div className="absolute bottom-1.5 lg:bottom-2 left-1.5 lg:left-2 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-gray-800 rounded-full border border-gray-600 flex items-center justify-center">
            <span className="text-xs text-gray-300 font-bold">{story.slides.length}</span>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-gray-300 mt-1 truncate w-full text-center">{story.user.name}</span>
    </div>
  );
};

export default Story; 