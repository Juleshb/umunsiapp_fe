import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Calendar, MoreVertical, Image as ImageIcon, Send, Settings, Hash, Eye, EyeOff, Crown, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import ClubManagement from '../components/ClubManagement';
import clubService from '../services/clubService';
import toast from 'react-hot-toast';

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClubData();
  }, [id]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const [clubResponse, postsResponse] = await Promise.all([
        clubService.getClubById(id),
        clubService.getClubPosts(id)
      ]);
      
      setClub(clubResponse.data);
      setPosts(postsResponse.data.posts);
    } catch (error) {
      console.error('Error fetching club data:', error);
      toast.error('Failed to load club data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    try {
      await clubService.joinClub(id);
      toast.success('Successfully joined the club!');
      fetchClubData(); // Refresh club data
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error(error.message || 'Failed to join club');
    }
  };

  const handleLeaveClub = async () => {
    try {
      await clubService.leaveClub(id);
      toast.success('Successfully left the club');
      fetchClubData(); // Refresh club data
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error(error.message || 'Failed to leave club');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        content: newPost,
        image: postImage
      };
      
      await clubService.createClubPost(id, postData);
      setNewPost('');
      setPostImage(null);
      setPostImagePreview(null);
      toast.success('Post created successfully!');
      fetchClubData(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const categories = clubService.getClubCategories();
    const cat = categories.find(c => c.value === category);
    return cat ? cat.emoji : '🏢';
  };

  const getCategoryLabel = (category) => {
    const categories = clubService.getClubCategories();
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
        {/* Fixed Navbar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        
        {/* Main Content Area - Fixed Height */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar 
              onCreatePost={() => {}}
              onCreateStory={() => {}}
              onCreateArticle={() => {}}
            />
          </div>
          
          {/* Main Content - Fixed Height */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white">Club Details</h1>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            </div>

            {/* Loading Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading club...</p>
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
  }

  if (!club) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
        {/* Fixed Navbar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        
        {/* Main Content Area - Fixed Height */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar 
              onCreatePost={() => {}}
              onCreateStory={() => {}}
              onCreateArticle={() => {}}
            />
          </div>
          
          {/* Main Content - Fixed Height */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white">Club Details</h1>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">Not Found</span>
              </div>
            </div>

            {/* Error Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Club not found</h2>
                <p className="text-gray-400 mb-6">The club you're looking for doesn't exist.</p>
                <Link
                  to="/clubs"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Clubs
                </Link>
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
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      
      {/* Main Content Area - Fixed Height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar 
            onCreatePost={() => {}}
            onCreateStory={() => {}}
            onCreateArticle={() => {}}
          />
        </div>
        
        {/* Main Content - Fixed Height */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/clubs"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-white">{club.name}</h1>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-400 text-sm">{getCategoryEmoji(club.category)} {getCategoryLabel(club.category)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!club.isMember ? (
                  <button
                    onClick={handleJoinClub}
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    Join Club
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveClub}
                    className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-600 rounded-lg hover:bg-red-900/30 transition-colors"
                  >
                    Leave Club
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
              {/* Club Hero Section */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6 group">
                <div className="h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                      <span className="text-9xl filter drop-shadow-lg">{getCategoryEmoji(club.category)}</span>
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm flex items-center space-x-1 ${
                      club.isPrivate 
                        ? 'bg-red-500/90 text-red-100 border border-red-400/50' 
                        : 'bg-green-500/90 text-green-100 border border-green-400/50'
                    }`}>
                      {club.isPrivate ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{club.isPrivate ? 'Private' : 'Public'}</span>
                    </span>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-900/80 text-gray-200 rounded-full backdrop-blur-sm border border-gray-700/50">
                      {getCategoryEmoji(club.category)} {getCategoryLabel(club.category)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{club.name}</h2>
                      <p className="text-gray-300 leading-relaxed">{club.description}</p>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-full">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">{club._count.members}</div>
                      <div className="text-xs text-gray-400">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-full">
                          <MessageSquare className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">{club._count.posts}</div>
                      <div className="text-xs text-gray-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="p-2 bg-green-500/20 rounded-full">
                          <Calendar className="h-5 w-5 text-green-400" />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {new Date(club.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">Created</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
                <div className="border-b border-gray-700">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                        activeTab === 'posts'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Posts
                    </button>
                    {club.isMember && (club.userRole === 'owner' || club.userRole === 'admin') && (
                      <button
                        onClick={() => setActiveTab('management')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                          activeTab === 'management'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {club.userRole === 'owner' ? <Crown className="h-4 w-4 mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                        Management
                      </button>
                    )}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'posts' && (
                <>
                  {/* Create Post */}
                  {club.isMember && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
                      <div className="p-6">
                        <form onSubmit={handleSubmitPost}>
                          <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Share something with your club..."
                            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={3}
                          />
                          
                          {postImagePreview && (
                            <div className="mt-4 relative inline-block">
                              <img
                                src={postImagePreview}
                                alt="Preview"
                                className="h-32 w-32 object-cover rounded-lg border border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPostImage(null);
                                  setPostImagePreview(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-md transition-colors">
                                <ImageIcon className="h-5 w-5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                            <button
                              type="submit"
                              disabled={submitting || !newPost.trim()}
                              className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {submitting ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                        <p className="text-gray-400">
                          {club.isMember 
                            ? 'Be the first to share something with your club!'
                            : 'Join the club to see posts and share content!'
                          }
                        </p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="relative">
                              <img
                                src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}&background=random`}
                                alt={post.author.firstName}
                                className="w-12 h-12 rounded-full border-2 border-gray-600"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-white">
                                  {post.author.firstName} {post.author.lastName}
                                </h4>
                                <span className="text-sm text-gray-400">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">@{post.author.username}</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                          
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full rounded-lg mb-4 border border-gray-600"
                            />
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
                            <div className="flex items-center space-x-6">
                              <span className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {post._count.clubLikes} likes
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {post._count.clubComments} comments
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'management' && (
                <ClubManagement club={club} onUpdate={fetchClubData} />
              )}
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
    </div>
  );
};

export default ClubDetail; 