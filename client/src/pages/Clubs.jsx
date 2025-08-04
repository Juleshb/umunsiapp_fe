import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Users, MessageSquare, Calendar, Hash, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MobileNav from '../components/MobileNav';
import clubService from '../services/clubService';
import CreateClubModal from '../components/CreateClubModal';
import toast from 'react-hot-toast';

const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const categories = clubService.getClubCategories();

  useEffect(() => {
    fetchClubs();
  }, [searchTerm, selectedCategory, pagination.page]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        category: selectedCategory,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await clubService.getAllClubs(filters);
      setClubs(response.data.clubs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      await clubService.joinClub(clubId);
      toast.success('Successfully joined the club!');
      fetchClubs(); // Refresh the list
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error(error.message || 'Failed to join club');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getCategoryEmoji = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.emoji : '🏢';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading && clubs.length === 0) {
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
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-white">Clubs</h1>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-400 text-sm">Discover communities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading clubs...</p>
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
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white">Clubs</h1>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">Discover communities</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Club
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter - Fixed */}
          <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </form>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
              {/* Clubs Grid */}
              {clubs.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-gray-400 mb-4">
                    <Hash className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No clubs found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || selectedCategory 
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to create a club!'
                    }
                  </p>
                  {!searchTerm && !selectedCategory && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Club
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubs.map((club) => (
                    <div key={club.id} className="group bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
                      {/* Club Image */}
                      <div className="h-52 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                        {club.image ? (
                          <img
                            src={club.image}
                            alt={club.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                            <span className="text-7xl filter drop-shadow-lg">{getCategoryEmoji(club.category)}</span>
                          </div>
                        )}
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                            club.isPrivate 
                              ? 'bg-red-500/90 text-red-100 border border-red-400/50' 
                              : 'bg-green-500/90 text-green-100 border border-green-400/50'
                          }`}>
                            {club.isPrivate ? '🔒 Private' : '🌐 Public'}
                          </span>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 text-xs font-medium bg-gray-900/80 text-gray-200 rounded-full backdrop-blur-sm border border-gray-700/50">
                            {getCategoryEmoji(club.category)} {getCategoryLabel(club.category)}
                          </span>
                        </div>
                      </div>

                      {/* Club Info */}
                      <div className="p-6">
                        {/* Title and Description */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {club.name}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                            {club.description}
                          </p>
                        </div>

                        {/* Stats with Icons */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-blue-500/20 rounded-full mr-2">
                                <Users className="h-4 w-4 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">{club._count.members}</div>
                                <div className="text-xs text-gray-400">members</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="p-1.5 bg-purple-500/20 rounded-full mr-2">
                                <MessageSquare className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">{club._count.posts}</div>
                                <div className="text-xs text-gray-400">posts</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Owner Info */}
                        <div className="flex items-center mb-5 p-3 bg-gray-700/30 rounded-lg">
                          <div className="relative">
                            <img
                              src={club.owner.avatar || `https://ui-avatars.com/api/?name=${club.owner.firstName}&background=random`}
                              alt={club.owner.firstName}
                              className="w-8 h-8 rounded-full border-2 border-gray-600"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">
                              {club.owner.firstName} {club.owner.lastName}
                            </div>
                            <div className="text-xs text-gray-400">Club Owner</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Link
                            to={`/clubs/${club.id}`}
                            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold text-blue-400 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 group/btn"
                          >
                            <span className="group-hover/btn:mr-1 transition-all">View Details</span>
                            <svg className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-all transform translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          {!club.isMember ? (
                            <button
                              onClick={() => handleJoinClub(club.id)}
                              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                            >
                              Join Club
                            </button>
                          ) : (
                            <span className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-semibold text-green-400 border border-green-600 rounded-lg bg-green-900/30">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === pagination.page
                            ? 'text-white bg-blue-600'
                            : 'text-gray-400 bg-gray-800 border border-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
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

      {/* Create Club Modal */}
      {showCreateModal && (
        <CreateClubModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClubs();
            toast.success('Club created successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Clubs; 