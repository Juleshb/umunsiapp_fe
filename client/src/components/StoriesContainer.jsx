import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Story from './Story';
import StoryViewer from './StoryViewer';
import storyService from '../services/storyService';
import socketService from '../services/socketService';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StoriesContainer = ({ onCreateStory, refreshRef }) => {
  const { user, socketService } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [newStoryIds, setNewStoryIds] = useState(new Set());
  const [isCheckingNewStories, setIsCheckingNewStories] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch stories from backend
  useEffect(() => {
    fetchStories();
  }, []);

  // Expose refreshStories function to parent
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = fetchStories;
    }
  }, [refreshRef]);

  // Listen for real-time WebSocket events
  useEffect(() => {
    if (!socketService) return;

    // Listen for new stories
    const handleNewStory = (storyData) => {
      console.log('Real-time new story received:', storyData);
      setNewStoryIds(prev => new Set([...prev, storyData.id]));
      // Refresh stories to show the new one
      setTimeout(() => {
        fetchStories();
      }, 1000);
      toast.success(`${storyData.author.firstName} added a new story!`);
    };

    // Listen for story updates
    const handleStoryUpdated = (storyData) => {
      console.log('Real-time story update received:', storyData);
      // Refresh stories to show the updated one
      setTimeout(() => {
        fetchStories();
      }, 1000);
      toast.success(`${storyData.author.firstName} updated their story!`);
    };

    // Listen for story deletions
    const handleStoryDeleted = (storyId) => {
      console.log('Real-time story deletion received:', storyId);
      // Remove the story from state
      setStories(prev => prev.filter(story => 
        !story.slides.some(slide => slide.storyId === storyId)
      ));
      toast.success('A story was deleted');
    };

    // Add event listeners
    socketService.on('new-story', handleNewStory);
    socketService.on('story-updated', handleStoryUpdated);
    socketService.on('story-deleted', handleStoryDeleted);

    // Cleanup listeners on unmount
    return () => {
      socketService.off('new-story', handleNewStory);
      socketService.off('story-updated', handleStoryUpdated);
      socketService.off('story-deleted', handleStoryDeleted);
    };
  }, [socketService]);

  // Auto-refresh stories every 30 seconds to check for new ones
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewStories();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Clear old story highlights after 5 minutes
  useEffect(() => {
    const clearHighlightsInterval = setInterval(() => {
      setNewStoryIds(new Set());
    }, 300000); // 5 minutes

    return () => clearInterval(clearHighlightsInterval);
  }, []);

  // Check WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService?.getConnectionStatus() || false);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, [socketService]);

  const checkForNewStories = async () => {
    try {
      setIsCheckingNewStories(true);
      const response = await storyService.getAllStories();
      
      if (response.success) {
        const currentTime = new Date();
        const currentStoryIds = new Set();
        let newStoriesCount = 0;
        
        // Check for new stories
        response.data.forEach(story => {
          currentStoryIds.add(story.id);
          const storyCreatedAt = new Date(story.createdAt);
          const isNewStory = lastFetchTime && storyCreatedAt > lastFetchTime;
          
          if (isNewStory) {
            newStoriesCount++;
            setNewStoryIds(prev => new Set([...prev, story.id]));
          }
        });
        
        // Show notification if new stories are found
        if (newStoriesCount > 0) {
          toast.success(`${newStoriesCount} new story${newStoriesCount > 1 ? 's' : ''} available!`);
          // Auto-refresh after 2 seconds to show the new stories
          setTimeout(() => {
            fetchStories();
          }, 2000);
        }
        
        setLastFetchTime(currentTime);
      }
    } catch (error) {
      console.error('Check for new stories error:', error);
    } finally {
      setIsCheckingNewStories(false);
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyService.getAllStories();
      
      if (response.success) {
        const currentTime = new Date();
        
        // Group stories by user
        const storiesByUser = {};
        
        // Add user's own story at the beginning
        const userStory = {
          id: 'user-story',
          user: {
            id: user?.id,
            name: 'Your Story',
            avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}&background=random`,
          },
          isLive: false,
          isUserStory: true,
          slides: [
            { type: 'text', content: 'Tap to add your story! ✨', duration: 3000 },
          ],
        };

        // Group backend stories by user
        response.data.forEach(story => {
          const userId = story.author.id;
          if (!storiesByUser[userId]) {
            storiesByUser[userId] = {
              id: `user-${userId}`,
              user: {
                id: story.author.id,
                name: `${story.author.firstName} ${story.author.lastName}`,
                avatar: story.author.avatar || `https://ui-avatars.com/api/?name=${story.author.firstName}&background=random`,
              },
              isLive: false,
              isUserStory: false,
              slides: [],
              backendData: [], // Keep original data for API calls
            };
          }
          
          // Check if this story is new (either by time or by ID tracking)
          const storyCreatedAt = new Date(story.createdAt);
          const isNewByTime = lastFetchTime && storyCreatedAt > lastFetchTime;
          const isNewById = newStoryIds.has(story.id);
          const isNewStory = isNewByTime || isNewById;
          
          // Add this story as a slide
          storiesByUser[userId].slides.push({
            type: story.content ? 'text' : 'image',
            content: story.content || story.image,
            duration: story.content ? 3000 : 5000,
            storyId: story.id,
            createdAt: story.createdAt,
            isNew: isNewStory
          });
          
          storiesByUser[userId].backendData.push(story);
        });

        // Convert grouped stories to array and sort by most recent story
        const groupedStories = Object.values(storiesByUser).map(userStories => {
          const hasNewStories = userStories.slides.some(slide => slide.isNew);
          const hasMultipleStories = userStories.slides.length > 1;
          
          return {
            ...userStories,
            slides: userStories.slides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            isNew: hasNewStories,
            hasMultipleStories
          };
        });

        // Sort users by their most recent story
        groupedStories.sort((a, b) => {
          const aLatest = a.slides[0]?.createdAt;
          const bLatest = b.slides[0]?.createdAt;
          return new Date(bLatest) - new Date(aLatest);
        });

        setStories([userStory, ...groupedStories]);
        setLastFetchTime(currentTime);
      } else {
        toast.error(response.message || 'Failed to fetch stories');
      }
    } catch (error) {
      console.error('Fetch stories error:', error);
      toast.error('Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh stories after creating a new one
  const refreshStoriesData = async () => {
    await fetchStories();
  };

  const handleStoryClick = (index) => {
    if (index === 0) {
      // "Your Story" - trigger create modal from parent
      if (onCreateStory) {
        onCreateStory();
      }
    } else {
      // Other stories - open viewer
      setCurrentStoryIndex(index);
      setCurrentSlideIndex(0);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setCurrentSlideIndex(0);
    } else {
      setCurrentStoryIndex(null);
      setCurrentSlideIndex(0);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setCurrentSlideIndex(0);
    }
  };

  const handleNextSlide = () => {
    const currentStory = stories[currentStoryIndex];
    if (currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleNextStory();
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else {
      handlePreviousStory();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 w-full max-w-xl">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Stories</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-2">
          {stories.map((story, index) => (
            <div key={story.id} onClick={() => handleStoryClick(index)} className="flex-shrink-0">
              <Story story={story} />
            </div>
          ))}
          {isCheckingNewStories && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-xs text-gray-500">Checking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {currentStoryIndex !== null && (
        <StoryViewer
          story={stories[currentStoryIndex]}
          currentSlideIndex={currentSlideIndex}
          onClose={() => {
            setCurrentStoryIndex(null);
            setCurrentSlideIndex(0);
          }}
          onNext={handleNextSlide}
          onPrevious={handlePreviousSlide}
          hasNext={currentSlideIndex < stories[currentStoryIndex].slides.length - 1 || currentStoryIndex < stories.length - 1}
          hasPrevious={currentSlideIndex > 0 || currentStoryIndex > 0}
        />
      )}
    </>
  );
};

export default StoriesContainer; 