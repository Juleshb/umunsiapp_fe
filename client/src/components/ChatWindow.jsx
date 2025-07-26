import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import socketService from '../services/socketService';
import chatService from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ChatWindow = ({ chat }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    console.log('Socket connected:', socketService.socket.connected);
  }, []);

  useEffect(() => {
    if (!user || !chat.user?.id) return;
    // Join user room
    socketService.socket.emit('join-user', user.id);
    // Always fetch chat history on mount or when chat changes
    const fetchHistory = async () => {
      try {
        const res = await chatService.getMessages(chat.user.id);
        console.log('Fetched chat history:', res);
        if (res.data && Array.isArray(res.data)) {
          setMessages(res.data.map(msg => ({
            ...msg,
            from: msg.senderId,
            to: msg.receiverId,
            text: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
    // Listen for incoming messages
    const handleMessage = (msg) => {
      console.log('Received chat-message (frontend):', msg, 'Current chat:', chat.user.id, 'User:', user.id);
      console.log(
        'msg.from:', msg.from, typeof msg.from,
        'msg.to:', msg.to, typeof msg.to,
        'chat.user.id:', chat.user.id, typeof chat.user.id,
        'user.id:', user.id, typeof user.id
      );
      // Only add messages for the current chat, using robust string comparison
      if (
        (msg.from?.toString() === chat.user.id?.toString() && msg.to?.toString() === user.id?.toString()) ||
        (msg.from?.toString() === user.id?.toString() && msg.to?.toString() === chat.user.id?.toString())
      ) {
        setMessages((prev) => {
          // Map the incoming message to the same shape as backend messages
          const mappedMsg = {
            ...msg,
            from: msg.from || msg.senderId,
            to: msg.to || msg.receiverId,
            text: msg.text || msg.content,
            timestamp: msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
          };
          const updated = [...prev, mappedMsg];
          console.log('Updated messages state:', updated);
          return updated;
        });
      }
      // Optionally show a notification for new messages in other chats
      // else {
      //   window.alert && window.alert('New message from ' + (msg.from === user.id ? 'You' : msg.from));
      // }
    };
    console.log('Setting up chat-message listener');
    socketService.on('chat-message', handleMessage);
    // Listen for typing indicator
    const handleTyping = (data) => {
      if (data.from === chat.user.id && data.to === user.id) {
        setIsTyping(data.isTyping);
      }
    };
    socketService.on('typing', handleTyping);
    return () => {
      socketService.off('chat-message', handleMessage);
      socketService.off('typing', handleTyping);
    };
  }, [user, chat.user.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        console.log('Sending message:', message);
        // Save to backend first
        const saved = await chatService.sendMessage(chat.user.id, message.trim());
        console.log('Message saved to backend:', saved);
        const msgData = {
          id: saved.data?.id || Date.now(),
          text: saved.data?.content || message,
          from: user.id,
          to: chat.user.id,
          timestamp: new Date(saved.data?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        };
        console.log('Emitting chat-message via socket:', msgData);
        socketService.socket.emit('chat-message', msgData);
        setMessage('');
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Emit typing event
    if (socketService.socket && chat.user?.id) {
      socketService.socket.emit('typing', { to: chat.user.id, from: user.id, isTyping: true });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketService.socket.emit('typing', { to: chat.user.id, from: user.id, isTyping: false });
      }, 1500);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
      case 'delivered':
        return <div className="w-3 h-3 bg-blue-400 rounded-full"></div>;
      case 'read':
        return <div className="w-3 h-3 bg-blue-600 rounded-full"></div>;
      default:
        return null;
    }
  };

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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getAvatarUrl(chat.user)}
              alt={chat.user.name}
              className="w-14 h-14 rounded-full object-cover border"
            />
            {chat.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-black text-lg">{chat.user.name}</h3>
              {chat.user.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>}
            </div>
            <p className="text-xs text-green-500 mt-0.5">{chat.user.isOnline ? 'Online' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><PhoneIcon className="h-5 w-5" /></button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><VideoCameraIcon className="h-5 w-5" /></button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><EllipsisVerticalIcon className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, idx) => {
          const isSent = msg.from === user.id;
          return (
            <div
              key={msg.id || idx}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              {!isSent && (
                <img
                  src={getAvatarUrl(chat.user)}
                  alt={chat.user.name}
                  className="w-8 h-8 rounded-full mr-2 border object-cover"
                />
              )}
              <div className="flex flex-col max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isSent
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-black rounded-bl-md'
                  }`}
                  style={{ boxShadow: 'none', border: 'none' }}
                >
                  <p className="text-base leading-relaxed break-words">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="text-xs text-blue-500 ml-2 mb-2">{chat.user.name || 'User'} is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 bg-white">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2 shadow-sm">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"><PaperClipIcon className="h-5 w-5" /></button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-2 py-2 bg-transparent border-none outline-none resize-none text-base"
              rows={1}
              style={{ minHeight: '36px', maxHeight: '80px' }}
            />
          </div>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"><FaceSmileIcon className="h-5 w-5" /></button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 