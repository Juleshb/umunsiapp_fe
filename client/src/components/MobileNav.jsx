import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolidIcon } from '@heroicons/react/24/solid';

const MobileNav = () => {
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, solidIcon: HomeSolidIcon, path: '/' },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon, path: '/chat' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, path: '/notifications' },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon, path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = isActive(item.path) && item.solidIcon ? item.solidIcon : item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.id === 'notifications' && notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Create Post Button */}
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-6 w-6" />
          <span className="text-xs font-medium">Create</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav; 