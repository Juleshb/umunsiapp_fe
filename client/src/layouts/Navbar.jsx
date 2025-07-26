import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Search, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Crown,
  GraduationCap
} from 'lucide-react';
import Logo from '../assets/Logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPlanBadge = () => {
    if (!user) return null;
    
    if (user.isStudent) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <GraduationCap className="w-3 h-3 mr-1" />
          Student
        </span>
      );
    }
    
    if (user.plan === 'PREMIUM') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Free
      </span>
    );
  };

  const getUserAvatar = (user) => {
    if (!user) {
      return 'https://ui-avatars.com/api/?name=Unknown&background=random';
    }
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      if (user.avatar.startsWith('uploads/')) {
        return `${BASE_URL}/${user.avatar}`;
      }
      if (user.avatar.startsWith('avatars/')) {
        return `${BASE_URL}/uploads/${user.avatar}`;
      }
      return `${BASE_URL}/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${user.firstName || user.username || 'Unknown'}&background=random`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-transparent py-2">
      <div className="max-w-5xl mx-auto px-2">
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 shadow-sm px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(252, 252, 252, 0.7) 0%, rgba(107,207,99,0.7) 100%)', backdropFilter: 'blur(2px)' }}>
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="App Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif', color: '#FFD600' }}>Umunsi Media</span>
          </div>
          {/* Search Bar */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-1 border border-gray-200">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none border-none text-sm w-32"
              />
              <span className="ml-2 text-xs text-gray-400 font-mono">⌘+K</span>
            </div>
            <button className="ml-3 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          {/* User Profile with Dropdown */}
          <div className="relative flex items-center bg-gray-100 rounded-xl px-2 py-1 border border-gray-200 ml-3 cursor-pointer select-none" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
            <img
              src={getUserAvatar(user)}
              alt={user.firstName}
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
            <div className="flex flex-col mr-2">
              <span className="text-sm font-semibold text-gray-900 leading-tight">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-gray-500 leading-tight">{user?.email}</span>
            </div>
            <button className="ml-1 text-gray-500 hover:text-gray-700">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-xl transition"
                >
                  Go to Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-xl transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 