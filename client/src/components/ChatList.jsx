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
      setLastMessages(prev => {
        const userId = msg.from === user.id ? msg.to : msg.from;
        const isCurrentChat = selectedChat?.user?.id === userId;
        return {
          ...prev,
          [userId]: {
            text: msg.text || msg.content,
            time: msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
            unreadCount: isCurrentChat ? 0 : ((prev[userId]?.unreadCount || 0) + 1),
          }
        };
      });
    };
    socketService.on('chat-message', handleNewMessage);
    return () => socketService.off('chat-message', handleNewMessage);
  }, [user.id, selectedChat]);

  const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
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
    return <div className="p-4 text-gray-500">Loading friends...</div>;
  }

  if (!friends.length && showAllUsers) {
    return (
      <div className="p-4">
        <div className="text-gray-500 mb-2">No friends found. People you may know:</div>
        <div className="divide-y divide-gray-100 overflow-y-auto h-full">
          {allUsers.map(person => (
            <button
              key={person.id}
              onClick={() => onSelectChat({ user: person })}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-left"
            >
              <div className="relative">
                <img
                  src={getAvatarUrl(person)}
                  alt={person.firstName || person.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                {person.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">{person.firstName || person.username || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">{person.isOnline ? 'Online' : 'Offline'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!friends.length) {
    return <div className="p-4 text-gray-500">No friends found. Connect with friends to start chatting!</div>;
  }

  return (
    <div className="overflow-y-auto h-full bg-white p-2">
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
            className={`w-full flex items-center gap-3 px-3 py-2 mb-1 transition text-left rounded-xl ${isSelected ? 'bg-blue-50' : ''}`}
            style={{ boxShadow: 'none', border: 'none' }}
          >
            <div className="relative">
              <img
                src={getAvatarUrl(friend)}
                alt={friend.firstName || friend.username || 'User'}
                className="w-12 h-12 rounded-full object-cover border"
              />
              {friend.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-black text-base truncate">{friend.firstName || friend.username || 'User'}</span>
                {lastMsg.time && <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{lastMsg.time}</span>}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 truncate max-w-[120px]">{lastMsg.text || (friend.isOnline ? 'Online' : 'Offline')}</span>
                {lastMsg.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{lastMsg.unreadCount}</span>
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