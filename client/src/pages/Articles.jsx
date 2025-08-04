import React, { useState, useEffect } from 'react';
import ArticleList from '../components/ArticleList';
import CreateArticleModal from '../components/CreateArticleModal';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, Filter, X, TrendingUp, Clock, Users } from 'lucide-react';
import { getAllTags } from '../services/articleService';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';

const Articles = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [articleStats, setArticleStats] = useState({
    total: 0,
    trending: 0,
    recent: 0
  });

  useEffect(() => {
    const fetchTags = async () => {
      const allTags = await getAllTags();
      setTags(allTags);
    };
    fetchTags();
  }, []);

  const handleModalClose = (created) => {
    setModalOpen(false);
    if (created) setRefresh(r => !r); // trigger refresh
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar onCreateArticle={() => setModalOpen(true)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-6 py-6 pb-20 lg:pb-6 bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <BookOpen className="h-8 w-8 mr-3 text-blue-400" />
                    Articles & Insights
                  </h1>
                  <p className="text-gray-400">Discover and share in-depth stories, guides, and insights from our community</p>
                </div>
                <div className="flex items-center space-x-3">
                  {user?.plan === 'PREMIUM' && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </button>
                  )}
                  <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-400">Total articles:</span>
                    <span className="text-sm text-white ml-2">
                      {articleStats.total || '...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Articles</p>
                    <p className="text-2xl font-bold text-white">{articleStats.total || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Trending</p>
                    <p className="text-2xl font-bold text-white">{articleStats.trending || 0}</p>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Recent</p>
                    <p className="text-2xl font-bold text-white">{articleStats.recent || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Filter Section */}
            <div className="mb-8">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-blue-400" />
                    Filter by Topic
                  </h3>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filter
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        selectedTag === tag.name 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25' 
                          : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:text-white'
                      }`}
                      onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                
                {selectedTag && (
                  <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <span className="font-medium">Active filter:</span> {selectedTag}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Article List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {selectedTag ? `Articles tagged "${selectedTag}"` : 'All Articles'}
                </h3>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Community curated</span>
                </div>
              </div>
              
              <ArticleList key={refresh + (selectedTag || '')} tag={selectedTag} />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      {user?.plan === 'PREMIUM' && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg w-16 h-16 hover:bg-blue-700 transition-all duration-200 shadow-blue-600/25"
          onClick={() => setModalOpen(true)}
          aria-label="Create Article"
        >
          <Plus className="h-8 w-8" />
        </button>
      )}

      <CreateArticleModal isOpen={modalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default Articles; 