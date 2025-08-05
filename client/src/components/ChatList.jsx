import React, { useEffect, useState } from 'react';
import friendService from '../services/friendService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';

const ChatList = ({ onSelectChat, selectedChat }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [lastMessages, setLastMessages] = useState({}); // { userId: { text, time, unreadCount } }

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await friendService.getFriends();
        const friendsArr = res.data?.friends || res.data || [];
        setFriends(friendsArr);
        if (!friendsArr.length) {
          // Fallback: fetch all users
          const usersRes = await userService.getAllUsers();
          setAllUsers((usersRes.data?.users || usersRes.data || []).filter(u => u.id !== user.id));
          setShowAllUsers(true);
        } else {
          setShowAllUsers(false);
        }
      } catch (err) {
        setFriends([]);
        setShowAllUsers(false);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [user.id]);

  useEffect(() => {
    const handleUserOnline = ({ userId, isOnline }) => {
      setFriends(friends => friends.map(f => f.id === userId ? { ...f, isOnline } : f));
      setAllUsers(users => users.map(u => u.id === userId ? { ...u, isOnline } : u));
    };
    socketService.on('user-online', handleUserOnline);
    return () => {
      socketService.off('user-online', handleUserOnline);
    };
  }, []);

  useEffect(() => {
    // Listen for new messages to update last message and unread count
    const handleNewMessage = (msg) => {
      console.log('ChatList received message:', msg);
      setLastMessages(prev => {
        const userId = msg.from === user.id ? msg.to : msg.from;
        const isCurrentChat = selectedChat?.user?.id === userId;
        const messageText = msg.text || msg.content || msg.message || '';
        const messageTime = msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
        
        return {
          ...prev,
          [userId]: {
            text: messageText,
            time: messageTime,
            unreadCount: isCurrentChat ? 0 : ((prev[userId]?.unreadCount || 0) + 1),
          }
        };
      });
    };
    socketService.on('chat-message', handleNewMessage);
    return () => socketService.off('chat-message', handleNewMessage);
  }, [user.id, selectedChat]);

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'https://umuhuza.store';
  // Helper to get avatar URL
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

  if (loading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!friends.length && showAllUsers) {
    return (
      <div className="p-3 sm:p-4">
        <div className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">No friends found. People you may know:</div>
        <div className="space-y-1">
          {allUsers.map(person => (
            <button
              key={person.id}
              onClick={() => onSelectChat({ user: person })}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 hover:bg-gray-700 transition-colors rounded-lg lg:rounded-md text-left group"
            >
              <div className="relative">
                <img
                  src={getAvatarUrl(person)}
                  alt={person.firstName || person.username || 'User'}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                {person.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate group-hover:text-gray-200 text-sm sm:text-base">
                  {person.firstName || person.username || 'User'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {person.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!friends.length) {
    return (
      <div className="p-3 sm:p-4 text-center">
        <div className="text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3">👥</div>
        <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">No friends found</div>
        <div className="text-gray-500 text-xs">Connect with friends to start chatting!</div>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {friends.map(friend => {
        const lastMsg = lastMessages[friend.id] || {};
        const isSelected = selectedChat?.user?.id === friend.id;
        return (
          <button
            key={friend.id}
            onClick={() => {
              onSelectChat({ user: friend });
              setLastMessages(prev => ({ ...prev, [friend.id]: { ...prev[friend.id], unreadCount: 0 } }));
            }}
            className={`w-full flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 transition-colors rounded-lg lg:rounded-md text-left group ${
              isSelected 
                ? 'bg-gray-700 text-white' 
                : 'hover:bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <img
                src={getAvatarUrl(friend)}
                alt={friend.firstName || friend.username || 'User'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
              />
              {friend.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="font-medium truncate text-sm sm:text-base">
                  {friend.firstName || friend.username || 'User'}
                </span>
                {lastMsg.time && (
                  <span className="text-xs text-gray-500 ml-1 sm:ml-2 whitespace-nowrap flex-shrink-0">
                    {lastMsg.time}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[140px]">
                  {lastMsg.text || (friend.isOnline ? 'Online' : 'Offline')}
                </span>
                {lastMsg.unreadCount > 0 && (
                  <span className="ml-1 sm:ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 min-w-[18px] sm:min-w-[20px] text-center">
                    {lastMsg.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList; 