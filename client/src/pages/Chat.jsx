import React, { useState } from 'react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { Phone, Video, MoreHorizontal, Mail, MapPin, Calendar, User, ChevronLeft, ChevronRight, Bug } from 'lucide-react';
import { testSocketConnection, testSocketEvents, monitorSocketEvents } from '../utils/socketTest';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
const getAvatarUrl = (user) => {
  if (!user) return 'https://ui-avatars.com/api/?name=Unknown&background=random';
  if (user.avatar) {
    if (user.avatar.startsWith('http')) return user.avatar;
    if (user.avatar.startsWith('uploads/')) return `${BASE_URL}/${user.avatar}`;
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${user.firstName || user.username || 'Unknown'}&background=random`;
};

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatList, setShowChatList] = useState(true); // Mobile toggle state
  const [showChatListDesktop, setShowChatListDesktop] = useState(true); // Desktop toggle state

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowChatList(false); // Hide chat list on mobile when chat is selected
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  const toggleChatListDesktop = () => {
    setShowChatListDesktop(!showChatListDesktop);
  };

  // Debug functions for development
  const handleDebugConnection = () => {
    testSocketConnection();
  };

  const handleDebugEvents = () => {
    testSocketEvents();
  };

  const handleMonitorEvents = () => {
    monitorSocketEvents();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Fixed Navbar - Hidden on mobile */}
      <div className="flex-shrink-0 hidden lg:block">
        <Navbar />
      </div>
      
      {/* Main Content Area - Fixed Height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Chat Area - Fixed Height */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Fixed Chat Header - Hidden on mobile */}
          <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 hidden lg:flex">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <h1 className="text-lg sm:text-xl font-bold text-white">Direct Messages</h1>
                <span className="text-gray-400 text-sm hidden sm:inline">•</span>
                <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">All conversations</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Debug buttons - only in development */}
                {import.meta.env.DEV && (
                  <>
                    <button 
                      onClick={handleDebugConnection}
                      className="p-1.5 sm:p-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded-md transition-colors"
                      title="Test Socket Connection"
                    >
                      <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={handleDebugEvents}
                      className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-md transition-colors"
                      title="Test Socket Events"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleMonitorEvents}
                      className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-md transition-colors"
                      title="Monitor Socket Events"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </>
                )}
                <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface - Fixed Height with Independent Scrolling */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chat List - Mobile: Toggleable, Desktop: Toggleable */}
            <div className={`${showChatList ? 'w-full' : 'hidden'} ${showChatListDesktop ? 'lg:w-80' : 'lg:w-0'} lg:flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
              {/* Fixed Search Header */}
              <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Mobile Back Button */}
                  {selectedChat && (
                    <button
                      onClick={handleBackToList}
                      className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search conversations"
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg lg:rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <svg className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Scrollable Chat List */}
              <div className="flex-1 overflow-y-auto">
                <ChatList onSelectChat={handleSelectChat} selectedChat={selectedChat} />
              </div>
            </div>
            
            {/* Desktop Toggle Button - Only visible when chat list is hidden */}
            {!showChatListDesktop && (
              <button
                onClick={toggleChatListDesktop}
                className="hidden lg:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-800 border border-gray-700 rounded-r-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            
            {/* Chat Window and User Info - Mobile: Full width when chat selected, Desktop: Always visible */}
            <div className={`${!showChatList ? 'w-full' : 'hidden'} lg:flex flex-1 overflow-hidden relative`}>
              {selectedChat ? (
                <div className="flex flex-1">
                  {/* Chat Window - Scrollable Content */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <ChatWindow 
                      chat={selectedChat} 
                      onToggleChatList={toggleChatListDesktop}
                      showChatList={showChatListDesktop}
                    />
                  </div>
                  
                  {/* User Info Panel - Hidden on mobile, visible on desktop */}
                  <div className="hidden lg:block w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col">
                    {/* Fixed User Info Header */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">User Information</h3>
                    </div>
                    
                    {/* Scrollable User Info Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4">
                        {/* User Profile */}
                        <div className="text-center mb-6">
                          <div className="relative inline-block">
                            <img
                              src={getAvatarUrl(selectedChat.user)}
                              alt={selectedChat.user?.firstName}
                              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                            />
                            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                          </div>
                          <h4 className="text-xl font-semibold text-white">
                            {selectedChat.user?.firstName} {selectedChat.user?.lastName}
                          </h4>
                          <p className="text-gray-400 text-sm">Online</p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2 mb-6">
                          <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </button>
                          <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
                            <Video className="h-4 w-4 mr-2" />
                            Video
                          </button>
                          <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* User Details */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{selectedChat.user?.email}</span>
                          </div>
                          
                          {selectedChat.user?.location && (
                            <div className="flex items-center space-x-3 text-gray-300">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedChat.user.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-3 text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">Member since {new Date(selectedChat.user?.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {selectedChat.user?.plan && (
                            <div className="flex items-center space-x-3 text-gray-300">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm capitalize">{selectedChat.user.plan.toLowerCase()} Plan</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Bio */}
                        {selectedChat.user?.bio && (
                          <div className="mt-6 p-3 bg-gray-700 rounded-lg">
                            <h5 className="text-sm font-medium text-white mb-2">About</h5>
                            <p className="text-sm text-gray-300">{selectedChat.user.bio}</p>
                          </div>
                        )}
                        
                        {/* Quick Stats */}
                        <div className="mt-6 p-3 bg-gray-700 rounded-lg">
                          <h5 className="text-sm font-medium text-white mb-3">Quick Stats</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                              <span>Mutual Friends</span>
                              <span className="text-white">12</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Common Groups</span>
                              <span className="text-white">3</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Shared Interests</span>
                              <span className="text-white">5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="text-gray-600 text-6xl sm:text-8xl mb-4 sm:mb-6">💬</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">Select a conversation</h3>
                    <p className="text-gray-400 text-base sm:text-lg">Choose a direct message to start chatting</p>
                    <div className="mt-4 sm:mt-6 text-gray-500 text-sm">
                      <p>Your conversations will appear here</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Navigation */}
      <div className="flex-shrink-0 lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
};

export default Chat; 