import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreHorizontal, Phone, Video, Search, ChevronLeft } from 'lucide-react';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';

const ChatWindow = ({ chat, onToggleChatList, showChatList }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when chat changes
  useEffect(() => {
    if (chat?.user?.id) {
      fetchMessages();
    }
  }, [chat?.user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      console.log('Real-time message received:', messageData);
      
      // Only add message if it's from the current chat user or to the current chat user
      if (messageData.senderId === chat?.user?.id || messageData.receiverId === chat?.user?.id) {
        const newMessage = {
          ...messageData,
          isOwn: messageData.senderId === user.id,
          text: messageData.content || messageData.text || messageData.message,
          timestamp: messageData.createdAt || messageData.timestamp || new Date().toISOString()
        };
        
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => 
            msg.id === newMessage.id || 
            (msg.text === newMessage.text && msg.timestamp === newMessage.timestamp)
          );
          if (!exists) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    };

    const handleTyping = (typingData) => {
      console.log('Typing indicator received:', typingData);
      if (typingData.from === chat?.user?.id && typingData.to === user.id) {
        setIsTyping(typingData.isTyping);
      }
    };

    // Ensure socket is connected
    if (socketService.getConnectionStatus()) {
      socketService.on('chat-message', handleNewMessage);
      socketService.on('typing', handleTyping);
    }

    return () => {
      socketService.off('chat-message', handleNewMessage);
      socketService.off('typing', handleTyping);
    };
  }, [chat?.user?.id, user.id]);

  const fetchMessages = async () => {
    if (!chat?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await chatService.getMessages(chat.user.id);
      console.log('API Response:', response);
      
      // Handle different response formats and ensure we have an array
      let fetchedMessages = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          fetchedMessages = response;
        } else if (Array.isArray(response.messages)) {
          fetchedMessages = response.messages;
        } else if (response.data && Array.isArray(response.data)) {
          fetchedMessages = response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
          fetchedMessages = response.data.messages;
        }
      }
      
      console.log('Fetched messages:', fetchedMessages);
      
      // Transform messages to include isOwn property
      const transformedMessages = fetchedMessages.map(msg => ({
        ...msg,
        isOwn: msg.senderId === user.id,
        text: msg.content || msg.text || msg.message,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString()
      }));
      
      console.log('Transformed messages:', transformedMessages);
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chat?.user?.id) return;
    
    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX
    
    // Stop typing indicator
    socketService.emitTyping({
      from: user.id,
      to: chat.user.id,
      isTyping: false
    });
    
    const newMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      text: messageText,
      isOwn: true,
      timestamp: new Date().toISOString(),
      senderId: user.id,
      receiverId: chat.user.id,
      content: messageText
    };
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, newMessage]);
    
    // Emit socket event for real-time delivery
    socketService.emitChatMessage({
      from: user.id,
      to: chat.user.id,
      text: messageText,
      content: messageText,
      id: newMessage.id,
      timestamp: newMessage.timestamp
    });
    
    try {
      const response = await chatService.sendMessage(chat.user.id, messageText);
      console.log('Message sent successfully:', response);
      
      // Update the temporary message with the real server response
      if (response && response.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, id: response.data.id, ...response.data }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      // Optionally show error message to user
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing start
    if (value.trim() && chat?.user?.id) {
      socketService.emitTyping({
        from: user.id,
        to: chat.user.id,
        isTyping: true
      });
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (chat?.user?.id) {
        socketService.emitTyping({
          from: user.id,
          to: chat.user.id,
          isTyping: false
        });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-gray-600 text-6xl sm:text-8xl mb-4 sm:mb-6">💬</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Select a conversation</h3>
          <p className="text-gray-400 text-base sm:text-lg">Choose a direct message to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Toggle Button */}
            <button
              onClick={onToggleChatList}
              className="hidden lg:block p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${showChatList ? 'rotate-0' : 'rotate-180'}`} />
            </button>
            <div className="relative">
              <img
                src={getAvatarUrl(chat.user)}
                alt={chat.user?.firstName || chat.user?.username || 'User'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${chat.user?.firstName || chat.user?.username || 'User'}&background=random`;
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-gray-800 rounded-full"></span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {chat.user?.firstName || chat.user?.username} {chat.user?.lastName}
              </h3>
              <p className="text-xs sm:text-sm text-green-400">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              <Video className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <div className="text-gray-600 text-4xl mb-2">💬</div>
              <div className="text-gray-400 text-sm">No messages yet</div>
              <div className="text-gray-500 text-xs">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm sm:text-base">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-700">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <button
            onClick={handleFileUpload}
            className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex-shrink-0"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex-shrink-0"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex-shrink-0">
            <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
      </div>
    </div>
  );
};

export default ChatWindow; 