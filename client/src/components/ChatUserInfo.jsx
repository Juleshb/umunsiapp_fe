import React from 'react';
import { Phone, Video, MoreHorizontal, Mail, MapPin, Calendar, User } from 'lucide-react';

const ChatUserInfo = ({ chatUser }) => {
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
  
  const getAvatarUrl = (user) => {
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

  if (!chatUser) {
    return (
      <div className="w-full h-full bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-center text-gray-400 mt-8">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a chat to view user information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-800 border-l border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">User Information</h3>
      </div>

      {/* User Profile */}
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={getAvatarUrl(chatUser)}
              alt={chatUser.name || chatUser.firstName}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
            />
            {chatUser.isOnline && (
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {chatUser.name || `${chatUser.firstName} ${chatUser.lastName}` || chatUser.username}
          </h2>
          <p className="text-gray-400 text-sm">
            {chatUser.isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors">
            <Phone className="h-4 w-4" />
            <span className="text-sm">Call</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors">
            <Video className="h-4 w-4" />
            <span className="text-sm">Video</span>
          </button>
          <button className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          {/* Email */}
          {chatUser.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white text-sm">{chatUser.email}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {chatUser.location && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white text-sm">{chatUser.location}</p>
              </div>
            </div>
          )}

          {/* Join Date */}
          {chatUser.createdAt && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Member since</p>
                <p className="text-white text-sm">
                  {new Date(chatUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Bio */}
          {chatUser.bio && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Bio</p>
              <p className="text-white text-sm">{chatUser.bio}</p>
            </div>
          )}

          {/* Plan/Badge */}
          {chatUser.plan && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Plan</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  chatUser.plan === 'PREMIUM' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                    : 'bg-gray-600 text-white'
                }`}>
                  {chatUser.plan}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mutual Friends or Common Interests */}
        <div className="mt-6 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Quick Stats</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-white font-semibold">0</p>
              <p className="text-gray-400 text-xs">Mutual Friends</p>
            </div>
            <div>
              <p className="text-white font-semibold">0</p>
              <p className="text-gray-400 text-xs">Common Groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUserInfo; 