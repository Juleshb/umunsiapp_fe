import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const ChatList = ({ onSelectChat, selectedChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const mockChats = [
    {
      id: 1,
      user: {
        name: 'Alice Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        isOnline: true,
        lastSeen: '2 min ago',
      },
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2 min ago',
      unreadCount: 2,
    },
    {
      id: 2,
      user: {
        name: 'Bob Smith',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        isOnline: false,
        lastSeen: '1 hour ago',
      },
      lastMessage: 'Thanks for the help!',
      timestamp: '1 hour ago',
      unreadCount: 0,
    },
    {
      id: 3,
      user: {
        name: 'Carol Lee',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        isOnline: true,
        lastSeen: 'Online',
      },
      lastMessage: 'See you tomorrow!',
      timestamp: '3 hours ago',
      unreadCount: 1,
    },
    {
      id: 4,
      user: {
        name: 'David Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        isOnline: false,
        lastSeen: 'Yesterday',
      },
      lastMessage: 'The project looks great!',
      timestamp: 'Yesterday',
      unreadCount: 0,
    },
    {
      id: 5,
      user: {
        name: 'Emma Davis',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        isOnline: true,
        lastSeen: 'Online',
      },
      lastMessage: 'Can you send me the files?',
      timestamp: '2 days ago',
      unreadCount: 0,
    },
  ];

  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredChats.length} conversations</p>
          </div>
          <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🔍</div>
              <p className="text-gray-500">No conversations found</p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50 border-l-4 ${
                selectedChat?.id === chat.id 
                  ? 'bg-blue-50 border-l-blue-500' 
                  : 'border-l-transparent'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={chat.user.avatar}
                  alt={chat.user.name}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                />
                {chat.user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{chat.user.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">{chat.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* More Options */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList; 