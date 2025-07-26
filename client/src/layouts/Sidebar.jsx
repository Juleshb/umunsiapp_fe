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
import Logo from '../assets/Logo.png';

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
    <div className="fixed left-0 top-0 w-20 shadow-sm border-r border-gray-200 h-full flex flex-col z-[999] rounded-tr-2xl rounded-br-2xl" style={{ background: 'linear-gradient(135deg, rgba(252,252,252,0.7) 0%, rgba(107,207,99,0.7) 100%)', backdropFilter: 'blur(2px)' }}>
      {/* Logo at the top */}
      <div className="flex items-center justify-center h-16">
        <img src={Logo} alt="App Logo" className="w-12 h-12 rounded-lg object-contain" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        {/* User Profile Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-full flex flex-col items-center justify-center gap-4 mt-2 mb-8">
            <button
              onClick={onCreatePost}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-700 text-white text-2xl transition-all"
              title="Create Post"
            >
              <Plus className="h-7 w-7" />
            </button>
            <button
              onClick={onCreateStory}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-2xl transition-all"
              title="Add Story"
            >
              <Camera className="h-7 w-7" />
            </button>
            {user?.plan === 'PREMIUM' && (
              <button
                onClick={onCreateArticle}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white text-2xl transition-all"
                title="Create Article"
              >
                <Plus className="h-7 w-7" />
              </button>
            )}
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2 items-center mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            // Example: show badge for Chat
            const showBadge = item.name === 'Chat';
            const badgeCount = 2; // Replace with real count if available
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-colors
                  ${isActive(item.href) ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${isActive(item.href) ? 'bg-blue-100' : 'bg-gray-100'} transition-all`}>
                  <Icon className={`h-6 w-6 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                  {showBadge && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">{badgeCount}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* Quick Stats */}
        {/* (Removed) */}
        {/* User avatar at bottom */}
        <div className="flex flex-col items-center mb-4 mt-auto">
          <div className="relative">
            <img
              src={getUserAvatar(user)}
              alt={user?.firstName}
              className="w-12 h-12 rounded-full object-cover border aspect-square"
              style={{ width: '30px', height: '30px', aspectRatio: '1 / 1' }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 