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
  HelpCircle
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
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

const Sidebar = ({ onCreatePost, onCreateStory, onCreateArticle }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Friends', href: '/friends', icon: Users },
    { name: 'Articles', href: '/articles', icon: Bookmark },
    { name: 'Saved', href: '/saved', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <img
                src={getUserAvatar(user)}
                alt={user?.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onCreatePost}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </button>
            
            <button
              onClick={onCreateStory}
              className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <Camera className="h-5 w-5" />
              <span>Add Story</span>
            </button>
            {user?.plan === 'PREMIUM' && (
              <button
                onClick={onCreateArticle}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Create Article</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Posts today:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Friends:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium capitalize">{user?.plan?.toLowerCase() || 'free'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 