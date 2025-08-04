import React, { useState, useEffect } from 'react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import FindFriends from '../components/FindFriends';
import userService from '../services/userService';

const Friends = () => {
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendCount = async () => {
      try {
        const stats = await userService.getProfileStatistics();
        setFriendCount(stats.totalFriends || 0);
      } catch (error) {
        console.error('Error fetching friend count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendCount();
  }, []);

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
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-6 py-6 pb-20 lg:pb-6 bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Friends & Connections</h1>
                  <p className="text-gray-400">Discover new people and manage your connections</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-400">Total friends:</span>
                    <span className="text-sm text-white ml-2">
                      {loading ? '...' : friendCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <FindFriends />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Friends; 