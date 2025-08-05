import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  MessageCircle, 
  User, 
  Plus,
  Camera,
  Users,
  Bookmark,
  Settings,
  HelpCircle,
  Hash,
  Star,
  MoreHorizontal,
  Download,
  X
} from 'lucide-react';
import Logo from '../assets/Logo.png';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://umuhuza.store';
const getUserAvatar = (user) => {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=Unknown&background=random';
  }
  if (user.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    if (user.avatar.startsWith('uploads/')) {
      return `${BASE_URL}/${user.avatar}`;
    }
    if (user.avatar.startsWith('avatars/')) {
      return `${BASE_URL}/uploads/${user.avatar}`;
    }
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${user.firstName || user.username || 'Unknown'}&background=random`;
};

const Sidebar = ({ onCreatePost, onCreateStory, onCreateArticle, isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, badge: null },
    { name: 'Chat', href: '/chat', icon: MessageCircle, badge: 3 },
    { name: 'Profile', href: '/profile', icon: User, badge: null },
    { name: 'Friends', href: '/friends', icon: Users, badge: null },
    { name: 'Clubs', href: '/clubs', icon: Hash, badge: null },
    { name: 'Articles', href: '/articles', icon: Bookmark, badge: null },
    { name: 'Saved', href: '/saved', icon: Star, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, badge: null },
    { name: 'Help', href: '/help', icon: HelpCircle, badge: null },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900/80 via-gray-800/80 to-gray-700/80 lg:from-gray-900 lg:via-gray-900 lg:to-gray-900 text-white flex flex-col z-50 border-r border-gray-600/60 lg:border-gray-700 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto w-80 lg:w-64`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="App Logo" className="w-8 h-8 rounded object-contain" />
            <span className="text-lg font-bold text-white">Umunsi Media</span>
          </div>
          <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {/* Quick Actions */}
          <div className="mb-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={onCreatePost}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <Plus className="h-5 w-5 mr-4" />
                Create Post
              </button>
              <button
                onClick={onCreateStory}
                className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <Camera className="h-5 w-5 mr-4" />
                Add Story
              </button>
              {user?.plan === 'PREMIUM' && (
                <button
                  onClick={onCreateArticle}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Bookmark className="h-5 w-5 mr-4" />
                  Create Article
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-full transition-colors ${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                  >
                    <Icon className={`h-5 w-5 mr-4 ${
                      isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="relative">
              <img
                src={getUserAvatar(user)}
                alt={user?.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 