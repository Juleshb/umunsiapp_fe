import { useAuth } from '../contexts/AuthContext';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import UserProfile from '../components/UserProfile';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileNav from '../components/MobileNav';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="flex">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-0 h-full overflow-y-auto">
          <Sidebar />
        </div>
        
        {/* Main Content with proper spacing */}
        <main className="flex-1 lg:ml-64 px-3 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6 bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Profile & Insights</h1>
                  <p className="text-gray-400 text-sm lg:text-base">Manage your account and view detailed analytics</p>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="px-3 lg:px-4 py-2 bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-lg border border-gray-600/60 lg:border-gray-700 backdrop-blur-sm">
                    <span className="text-xs lg:text-sm text-gray-400">Last updated:</span>
                    <span className="text-xs lg:text-sm text-white ml-1 lg:ml-2">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <UserProfile />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Profile; 