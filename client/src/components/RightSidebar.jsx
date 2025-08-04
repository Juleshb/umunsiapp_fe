import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Flame, UserPlus, Bell, Users, TrendingUp, Hash, MoreHorizontal } from 'lucide-react';

const RightSidebar = () => {
  const location = useLocation();
  const isClubsPage = location.pathname.includes('/clubs');

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

  const popularClubs = [
    { id: 1, name: 'Tech Enthusiasts', category: 'Professional', members: '1.2K', emoji: '💼' },
    { id: 2, name: 'Art & Design', category: 'Arts', members: '856', emoji: '🎨' },
    { id: 3, name: 'Student Network', category: 'Academic', members: '2.1K', emoji: '📚' },
    { id: 4, name: 'Community Service', category: 'Community Service', members: '634', emoji: '❤️' },
  ];

  const clubCategories = [
    { name: 'Media Clubs', emoji: '📺', count: '45 clubs' },
    { name: 'Cultural', emoji: '🎭', count: '32 clubs' },
    { name: 'Academic', emoji: '📚', count: '67 clubs' },
    { name: 'Professional', emoji: '💼', count: '89 clubs' },
    { name: 'Arts', emoji: '🎨', count: '23 clubs' },
  ];

  return (
    <aside className="w-full h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Discover</h2>
          <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={isClubsPage ? "Search clubs..." : "Search ChatApp..."}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-600 transition-colors">
              <UserPlus className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-300">Find Friends</span>
            </button>
            <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-600 transition-colors">
              <Bell className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-300">Notifications</span>
            </button>
            {isClubsPage && (
              <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-600 transition-colors">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Create Club</span>
              </button>
            )}
          </div>
        </div>

        {/* Club-specific content */}
        {isClubsPage && (
          <>
            {/* Popular Clubs */}
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Popular Clubs
              </h3>
              <div className="space-y-3">
                {popularClubs.map((club) => (
                  <div key={club.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-lg">
                        {club.emoji}
                      </div>
                      <div>
                        <div className="font-medium text-white">{club.name}</div>
                        <div className="text-xs text-gray-400">{club.category} • {club.members} members</div>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Club Categories */}
            <div>
              <h3 className="font-semibold text-white mb-3">Explore Categories</h3>
              <div className="space-y-2">
                {clubCategories.map((category, index) => (
                  <div key={index} className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.emoji}</span>
                        <span className="font-medium text-white">{category.name}</span>
                      </div>
                      <div className="text-xs text-gray-400">{category.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Trending Topics */}
        {!isClubsPage && (
          <div>
            <h3 className="font-semibold text-white mb-3">Trending Topics</h3>
            <div className="space-y-2">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="font-medium text-white">{topic.topic}</div>
                  <div className="text-xs text-gray-400">{topic.posts}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isClubsPage && (
          <div>
            <h3 className="font-semibold text-white mb-3">Suggested for You</h3>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={suggestion.avatar} alt={suggestion.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-medium text-white">{suggestion.name}</div>
                      <div className="text-xs text-gray-400">{suggestion.followers} followers</div>
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div>© 2024 ChatApp</div>
          <div className="flex gap-2">
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar; 