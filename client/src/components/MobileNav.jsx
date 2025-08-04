import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  User, 
  Bell,
  Plus,
  Hash,
  Bookmark,
  Search,
  Settings,
  HelpCircle,
  Star,
  Users
} from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/chat' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-600/80 border-t border-gray-600/60 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-0 p-1 rounded-md transition-all ${
                active
                  ? 'text-blue-400 bg-gray-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/20'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4 w-4 ${active ? 'text-blue-400' : ''}`} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile/More Button */}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0 p-1 rounded-md transition-all ${
            isActive('/profile')
              ? 'text-blue-400 bg-gray-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-600/20'
          }`}
        >
          <div className="relative">
            <User className={`h-4 w-4 ${isActive('/profile') ? 'text-blue-400' : ''}`} />
          </div>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav; 