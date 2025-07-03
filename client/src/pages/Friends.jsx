import React from 'react';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import MobileNav from '../components/MobileNav';
import FindFriends from '../components/FindFriends';

const Friends = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="hidden md:block w-64 bg-white shadow-sm min-h-screen overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-6">
            <FindFriends />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends; 