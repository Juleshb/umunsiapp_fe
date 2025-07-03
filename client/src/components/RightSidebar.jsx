import React from 'react';
import { MagnifyingGlassIcon, FireIcon, UserPlusIcon, BellIcon } from '@heroicons/react/24/outline';

const RightSidebar = () => {
  const suggestions = [
    { id: 1, name: 'Tech Trends', avatar: 'https://ui-avatars.com/api/?name=Tech&background=blue', followers: '2.5K' },
    { id: 2, name: 'Design Hub', avatar: 'https://ui-avatars.com/api/?name=Design&background=purple', followers: '1.8K' },
    { id: 3, name: 'Startup News', avatar: 'https://ui-avatars.com/api/?name=Startup&background=green', followers: '3.2K' },
  ];

  const trendingTopics = [
    { id: 1, topic: '#ReactJS', posts: '2.3K posts' },
    { id: 2, topic: '#WebDesign', posts: '1.8K posts' },
    { id: 3, topic: '#Innovation', posts: '3.1K posts' },
    { id: 4, topic: '#TechNews', posts: '1.5K posts' },
  ];

  return (
    <aside className="w-full h-full bg-white border-l p-4 gap-6 overflow-y-auto">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search ChatApp..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FireIcon className="h-5 w-5 text-orange-500" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition">
            <UserPlusIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700">Find Friends</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition">
            <BellIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-700">Notifications</span>
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Trending Topics</h3>
        <div className="space-y-2">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="font-medium text-gray-800">{topic.topic}</div>
              <div className="text-xs text-gray-500">{topic.posts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Suggested for You</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <img src={suggestion.avatar} alt={suggestion.name} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-medium text-gray-800">{suggestion.name}</div>
                  <div className="text-xs text-gray-500">{suggestion.followers} followers</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-500 space-y-1">
        <div>© 2024 ChatApp</div>
        <div className="flex gap-2">
          <span className="hover:text-gray-700 cursor-pointer">Privacy</span>
          <span className="hover:text-gray-700 cursor-pointer">Terms</span>
          <span className="hover:text-gray-700 cursor-pointer">Help</span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar; 