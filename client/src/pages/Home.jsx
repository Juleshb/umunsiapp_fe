import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import Feed from '../features/feed/Feed';
import StoriesContainer from '../components/StoriesContainer';
import RightSidebar from '../components/RightSidebar';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import MobileNav from '../components/MobileNav';
import storyService from '../services/storyService';
import toast from 'react-hot-toast';
import CreateArticleModal from '../components/CreateArticleModal';
import { Sparkles, TrendingUp, Clock, Users, MessageSquare } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const storiesRefreshRef = useRef();

  const handleCreatePost = (newPost) => {
    // Here you would typically save the post to your backend
    console.log('New post created:', newPost);
    // You can add the post to your feed state here
  };

  const handleCreateStory = async (newStory) => {
    try {
      setIsCreatingStory(true);
      
      // Prepare story data for backend
      const storyData = {
        content: newStory.content || '',
        image: newStory.image || null
      };

      // Save story to backend
      const response = await storyService.createStory(storyData);
      
      if (response.success) {
        toast.success('Story created successfully!');
        
        // Refresh stories container immediately to show the new story with highlight
        if (storiesRefreshRef.current) {
          await storiesRefreshRef.current();
        }
        
        // Close the modal
        setIsStoryModalOpen(false);
      } else {
        toast.error(response.message || 'Failed to create story');
      }
      
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error(error.message || 'Failed to create story');
    } finally {
      setIsCreatingStory(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <div className="flex-shrink-0">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </div>
      
      {/* Main Content Area - Fixed Height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar 
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setIsArticleModalOpen(true)}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
        
        {/* Fixed Left Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar 
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setIsArticleModalOpen(true)}
          />
        </div>
        
        {/* Main Content - Fixed Height */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header - Hidden on mobile */}
          <div className="hidden lg:flex flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    What's happening in your world today?
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-gray-700 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-300">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
              {/* Quick Stats Cards - Hidden on mobile */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Friends</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">New Messages</p>
                      <p className="text-2xl font-bold text-white">7</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-full">
                      <MessageSquare className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Today's Posts</p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Clock className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stories Section - Mobile Optimized */}
              <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 mb-4 lg:mb-6 overflow-hidden backdrop-blur-sm">
                <div className="p-3 lg:p-4 border-b border-gray-600/60 lg:border-gray-700">
                  <h2 className="text-base lg:text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mr-2 lg:mr-3"></div>
                    Stories
                  </h2>
                  <p className="text-gray-400 text-xs lg:text-sm mt-1">
                    Share your moments with friends
                  </p>
                </div>
                <div className="p-2 lg:p-4">
                  <StoriesContainer 
                    refreshRef={storiesRefreshRef}
                    onCreateStory={() => setIsStoryModalOpen(true)} 
                  />
                </div>
              </div>
              
              {/* Feed Section - Mobile Optimized */}
              <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 overflow-hidden backdrop-blur-sm">
                <div className="p-3 lg:p-4 border-b border-gray-600/60 lg:border-gray-700">
                  <h2 className="text-base lg:text-lg font-semibold text-white flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2 lg:mr-3"></div>
                    Feed
                  </h2>
                  <p className="text-gray-400 text-xs lg:text-sm mt-1">
                    Latest updates from your network
                  </p>
                </div>
                <div className="p-2 lg:p-4">
                  <Feed />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <RightSidebar />
        </div>
      </div>

      {/* Fixed Mobile Navigation */}
      <div className="flex-shrink-0 lg:hidden">
        <MobileNav />
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleCreatePost}
      />
      <CreateStoryModal 
        isOpen={isStoryModalOpen} 
        onClose={() => setIsStoryModalOpen(false)}
        onSave={handleCreateStory}
        isLoading={isCreatingStory}
      />
      {user?.plan === 'PREMIUM' && (
        <CreateArticleModal 
          isOpen={isArticleModalOpen} 
          onClose={() => setIsArticleModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home; 