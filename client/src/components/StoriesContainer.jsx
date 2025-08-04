import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Story from './Story';
import StoryViewer from './StoryViewer';
import StoryPreviewModal from './StoryPreviewModal';
import storyService from '../services/storyService';
import socketService from '../services/socketService';
import { Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const StoriesContainer = ({ onCreateStory, refreshRef }) => {
  const { user, socketService } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [newStoryIds, setNewStoryIds] = useState(new Set());
  const [isCheckingNewStories, setIsCheckingNewStories] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Add a ref for the scrollable container
  const storyBarRef = React.useRef(null);

  // Scroll handlers
  const scrollLeft = () => {
    if (storyBarRef.current) {
      storyBarRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (storyBarRef.current) {
      storyBarRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

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

    // Listen for story likes
    const handleStoryLiked = (data) => {
      console.log('Real-time story liked received:', data);
      // Update the story's like status in the stories array
      setStories(prev => prev.map(story => {
        if (story.slides && story.slides.some(slide => slide.storyId === data.storyId)) {
          return {
            ...story,
            isLiked: true,
            likesCount: (story.likesCount || 0) + 1
          };
        }
        return story;
      }));
    };

    // Listen for story unlikes
    const handleStoryUnliked = (data) => {
      console.log('Real-time story unliked received:', data);
      // Update the story's like status in the stories array
      setStories(prev => prev.map(story => {
        if (story.slides && story.slides.some(slide => slide.storyId === data.storyId)) {
          return {
            ...story,
            isLiked: false,
            likesCount: Math.max((story.likesCount || 0) - 1, 0)
          };
        }
        return story;
      }));
    };

    // Add event listeners
    socketService.on('new-story', handleNewStory);
    socketService.on('story-updated', handleStoryUpdated);
    socketService.on('story-deleted', handleStoryDeleted);
    socketService.on('story-liked', handleStoryLiked);
    socketService.on('story-unliked', handleStoryUnliked);

    // Cleanup listeners on unmount
    return () => {
      socketService.off('new-story', handleNewStory);
      socketService.off('story-updated', handleStoryUpdated);
      socketService.off('story-deleted', handleStoryDeleted);
      socketService.off('story-liked', handleStoryLiked);
      socketService.off('story-unliked', handleStoryUnliked);
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
      // Other stories - open full screen preview modal
      setCurrentStoryIndex(index);
      setCurrentSlideIndex(0);
      setIsPreviewModalOpen(true);
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
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-3 lg:p-4 mb-4 lg:mb-6 overflow-hidden backdrop-blur-sm">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-3 lg:p-4 mb-4 lg:mb-6 overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="p-1.5 lg:p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-white">Stories</h3>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400 hidden sm:block">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          {/* Left arrow - Hidden on mobile */}
          <button 
            onClick={scrollLeft} 
            className="hidden lg:block p-2 rounded-full bg-gray-700 hover:bg-gray-600 mr-3 disabled:opacity-50 transition-colors" 
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div ref={storyBarRef} className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 lg:px-0">
            {/* Create story card */}
            <div onClick={() => onCreateStory && onCreateStory()} className="flex-shrink-0 cursor-pointer">
              <Story isCreateCard user={user} />
            </div>
            {/* Other stories (skip 'Your story') */}
            {stories.slice(1).map((story, index) => (
              <div key={story.id} onClick={() => handleStoryClick(index + 1)} className="flex-shrink-0">
                <Story story={story} />
              </div>
            ))}
          </div>
          {/* Right arrow - Hidden on mobile */}
          <button 
            onClick={scrollRight} 
            className="hidden lg:block p-2 rounded-full bg-gray-700 hover:bg-gray-600 ml-3 disabled:opacity-50 transition-colors" 
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Story Preview Modal - Full Screen */}
      {isPreviewModalOpen && currentStoryIndex !== null && (
        <StoryPreviewModal
          isOpen={isPreviewModalOpen}
          story={stories[currentStoryIndex]}
          currentSlideIndex={currentSlideIndex}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setCurrentStoryIndex(null);
            setCurrentSlideIndex(0);
          }}
        />
      )}

      {/* Story Viewer Modal - Fallback */}
      {currentStoryIndex !== null && !isPreviewModalOpen && (
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