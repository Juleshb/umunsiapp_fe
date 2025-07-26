import React, { useState, useEffect } from 'react';
import PostCard from '../../components/PostCard';
import QuickPost from '../../components/QuickPost';
import CreatePostModal from '../../components/CreatePostModal';
import postService from '../../services/postService';
import socketService from '../../services/socketService';
import { PlusIcon } from '@heroicons/react/24/outline';
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
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-gray-600 mb-4">No posts yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
            <div className="w-full max-w-xl mt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Posts'}
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