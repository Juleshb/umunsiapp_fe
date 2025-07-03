import React, { useState, useEffect } from 'react';
import ArticleList from '../components/ArticleList';
import CreateArticleModal from '../components/CreateArticleModal';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar onCreateArticle={() => setModalOpen(true)} />
        </div>
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 lg:mr-80 px-4 py-6 pb-20 lg:pb-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Title and Description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
              <p className="text-gray-600 mt-1">Discover and share in-depth stories, guides, and insights from our community.</p>
            </div>
            {/* Tag Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedTag === tag.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'}`}
                    onClick={() => setSelectedTag(tag.name)}
                  >
                    {tag.name}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                    onClick={() => setSelectedTag(null)}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
            {/* Article List */}
            <ArticleList key={refresh + (selectedTag || '')} tag={selectedTag} />
          </div>
        </main>
        {/* Fixed Right Sidebar */}
        <div className="hidden lg:block w-80 fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
      {/* Mobile Navigation */}
      <MobileNav />
      {/* Floating Action Button for mobile */}
      {user?.plan === 'PREMIUM' && (
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg w-16 h-16 hover:bg-blue-700 transition-all text-3xl"
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