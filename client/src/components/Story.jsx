import React from 'react';

const Story = ({ story }) => {
  const hasMultipleStories = story.hasMultipleStories || (story.slides && story.slides.length > 1);
  const isNewStory = story.isNew;

  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer group">
      <div className="relative">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-colors ${
          isNewStory 
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}>
          <img 
            src={story.user.avatar} 
            alt={story.user.name}
            className="w-full h-full rounded-full object-cover border-2 border-white"
          />
        </div>
        {story.isLive && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        {hasMultipleStories && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-xs text-white font-bold">{story.slides.length}</span>
          </div>
        )}
        {isNewStory && (
          <div className="absolute -top-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      <span className={`text-xs truncate max-w-14 sm:max-w-16 group-hover:text-gray-800 transition text-center ${
        isNewStory ? 'text-purple-600 font-semibold' : 'text-gray-600'
      }`}>
        {story.user.name}
      </span>
    </div>
  );
};

export default Story; 