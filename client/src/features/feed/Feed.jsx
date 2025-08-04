import React, { useState, useEffect } from 'react';
import PostCard from '../../components/PostCard';
import QuickPost from '../../components/QuickPost';
import CreatePostModal from '../../components/CreatePostModal';
import postService from '../../services/postService';
import socketService from '../../services/socketService';
import { Plus, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Listen for real-time post like/comment updates
    const handleUpdate = () => {
      fetchPosts(1); // Refetch first page for simplicity
    };
    socketService.on('post-like-updated', handleUpdate);
    socketService.on('post-comment-updated', handleUpdate);
    return () => {
      socketService.off('post-like-updated', handleUpdate);
      socketService.off('post-comment-updated', handleUpdate);
    };
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(pageNum, 10);
      
      if (response.success) {
        if (pageNum === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.posts]);
        }
        setHasMore(response.data.posts.length === 10);
        setPage(pageNum);
      } else {
        toast.error(response.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleQuickPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="">
      <QuickPost onCreatePost={handleQuickPost} />
      
      {loading && posts.length === 0 ? (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-6 lg:p-8 text-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-500 mx-auto mb-3 lg:mb-4"></div>
            <p className="text-gray-400 text-sm lg:text-base">Loading posts...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-6 lg:p-8 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-3 lg:mb-4">
              <div className="p-2 lg:p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-4 lg:mb-6 text-sm lg:text-base">Be the first to share something with your network!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-semibold text-sm lg:text-base"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 inline mr-2" />
              Create your first post
            </button>
          </div>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {hasMore && (
            <div className="w-full mt-4 lg:mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 border border-gray-600/60 lg:border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm lg:text-base backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                    Load More Posts
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePost}
      />
    </div>
  );
};

export default Feed; 