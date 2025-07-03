import React, { useState } from 'react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </div>
        
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 lg:mr-80 px-4 py-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Chat with your friends and connections</p>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-[calc(100vh-12rem)]">
              <div className="flex h-full">
                {/* Chat List */}
                <div className="w-full md:w-80 border-r border-gray-200">
                  <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} />
                </div>
                
                {/* Chat Window */}
                <div className="hidden md:flex flex-1">
                  {selectedChat ? (
                    <ChatWindow chat={selectedChat} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a chat</h3>
                        <p className="text-gray-500">Choose a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Chat; 