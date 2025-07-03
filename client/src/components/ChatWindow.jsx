import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, PhoneIcon, VideoCameraIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const ChatWindow = ({ chat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hey! How are you doing?',
      sender: 'them',
      timestamp: '2:30 PM',
      status: 'read',
    },
    {
      id: 2,
      text: 'I\'m doing great! Thanks for asking. How about you?',
      sender: 'me',
      timestamp: '2:32 PM',
      status: 'read',
    },
    {
      id: 3,
      text: 'Pretty good! Working on some exciting projects.',
      sender: 'them',
      timestamp: '2:33 PM',
      status: 'read',
    },
    {
      id: 4,
      text: 'That sounds interesting! What kind of projects?',
      sender: 'me',
      timestamp: '2:35 PM',
      status: 'sent',
    },
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={chat.user.avatar}
              alt={chat.user.name}
              className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
            />
            {chat.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{chat.user.name}</h3>
            <p className="text-sm text-gray-500">
              {chat.user.isOnline ? 'Online' : chat.user.lastSeen}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <VideoCameraIcon className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender === 'me'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 ${
                msg.sender === 'me' ? 'justify-end' : 'justify-start'
              }`}>
                <span className={`text-xs ${
                  msg.sender === 'me' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {msg.timestamp}
                </span>
                {msg.sender === 'me' && (
                  <div className="flex items-center">
                    {getStatusIcon(msg.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0">
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0">
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 