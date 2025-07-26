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

const Home = () => {
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
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
    <div className="min-h-screen">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar 
            onCreatePost={() => setIsPostModalOpen(true)}
            onCreateStory={() => setIsStoryModalOpen(true)}
            onCreateArticle={() => setIsArticleModalOpen(true)}
          />
        </div>
        
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 lg:mr-80 px-4 py-6 pb-20 lg:pb-6">
          <div className="max-w-2xl mx-auto">
            {/* Welcome Message */}
            {/* <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                What's on your mind today?
              </p>
            </div> */}

            {/* Stories */}
            <StoriesContainer 
              refreshRef={storiesRefreshRef}
              onCreateStory={() => setIsStoryModalOpen(true)} 
            />
            
            {/* Feed */}
            <Feed />
          </div>
        </main>
        
        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

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