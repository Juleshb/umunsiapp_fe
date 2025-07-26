import React from 'react';

const Story = ({ story, isCreateCard, isYourStory, user }) => {
  if (isCreateCard) {
    return (
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-24 sm:w-28">
        <div className="relative w-full h-36 sm:h-40 rounded-xl bg-gray-100 flex flex-col items-center justify-center shadow-md overflow-hidden">
          <img
            src={user?.avatar || 'https://ui-avatars.com/api/?name=U'}
            alt={user?.firstName}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700 mt-1">Create story</span>
      </div>
    );
  }

  if (isYourStory) {
    // Use the last slide's image as background if available
    const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
    return (
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-24 sm:w-28">
        <div className="relative w-full h-36 sm:h-40 rounded-xl shadow-md overflow-hidden border-2 border-blue-500">
          <img
            src={lastImage}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-4 border-blue-500">
            <img
              src={story.user.avatar}
              alt={story.user.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700 mt-1">Your story</span>
      </div>
    );
  }

  // Other stories
  // Use the last slide's image as background if available
  const lastImage = story.slides && story.slides.length > 0 ? story.slides[0].content : story.user.avatar;
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group w-24 sm:w-28">
      <div className="relative w-full h-36 sm:h-40 rounded-xl shadow-md overflow-hidden">
        <img
          src={lastImage}
          alt={story.user.name}
          className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-4 border-blue-500">
          <img
            src={story.user.avatar}
            alt={story.user.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-700 mt-1 truncate w-full text-center">{story.user.name}</span>
    </div>
  );
};

export default Story; 