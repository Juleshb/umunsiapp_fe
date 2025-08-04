import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Crown, 
  GraduationCap,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  BookOpen,
  Calendar,
  Activity,
  BarChart3,
  Target,
  Award,
  Clock,
  Zap,
  Star,
  Eye,
  Share2,
  ThumbsUp,
  Hash,
  TrendingDown,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import userService from '../services/userService';

const UserProfile = () => {
  const { user, updateProfile, updateCoverImage, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        console.log('Fetching profile statistics...');
        const data = await userService.getProfileStatistics();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStatsError('Failed to load statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatar(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target.result);
        reader.readAsDataURL(file);
      } else if (type === 'cover') {
        setCoverImage(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setRefreshTrigger(prev => prev + 1); // Refresh stats after profile update
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCoverImageUpdate = async () => {
    if (coverImage) {
      try {
        await updateCoverImage(coverImage);
        setCoverImage(null);
        setRefreshTrigger(prev => prev + 1); // Refresh stats after cover update
      } catch (error) {
        console.error('Error updating cover image:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
    setAvatar(null);
    setAvatarPreview('');
  };

  const getPlanBadge = () => {
    if (!user?.plan) return null;
    
    const planConfig = {
      FREE: { color: 'bg-gray-600', text: 'Free Plan' },
      PREMIUM: { color: 'bg-gradient-to-r from-yellow-500 to-orange-500', text: 'Premium' },
      PRO: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'Pro' }
    };
    
    const config = planConfig[user.plan] || planConfig.FREE;
    
    return (
      <div className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <Crown className="h-3 w-3" />
        {config.text}
      </div>
    );
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'N/A';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEngagementRate = () => {
    if (!stats) return 0;
    return stats.engagementRate || 0;
  };

  const getActivityScore = () => {
    if (!stats) return 0;
    return Math.min(100, stats.activityScore || 0);
  };

  const getContentCreationRate = () => {
    if (!stats?.performance) return 0;
    return stats.performance.contentCreationRate || 0;
  };

  const getAverageMessagesPerChat = () => {
    if (!stats?.chatAnalysis) return 0;
    return stats.chatAnalysis.averageMessagesPerChat || 0;
  };

  const getRecentActivity = () => {
    if (!stats?.recentActivity) return { posts: 0, articles: 0, likes: 0, storyLikes: 0 };
    return stats.recentActivity;
  };

  const getPopularContent = () => {
    return {
      posts: stats?.popularPosts || [],
      articles: stats?.popularArticles || []
    };
  };

  const getMemberDuration = () => {
    if (!stats?.daysSinceJoin) return 'N/A';
    const days = stats.daysSinceJoin;
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const getTrendIndicator = (current, previous = 0) => {
    if (current > previous) {
      return { icon: ArrowUp, color: 'text-green-400', text: 'Up' };
    } else if (current < previous) {
      return { icon: ArrowDown, color: 'text-red-400', text: 'Down' };
    } else {
      return { icon: Minus, color: 'text-gray-400', text: 'Stable' };
    }
  };

  const getPerformanceColor = (value, threshold = 50) => {
    if (value >= threshold * 1.2) return 'text-green-400';
    if (value >= threshold) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getActivityLevel = (score) => {
    if (score >= 80) return { level: 'Very Active', color: 'text-green-400', bg: 'bg-green-600/20' };
    if (score >= 60) return { level: 'Active', color: 'text-blue-400', bg: 'bg-blue-600/20' };
    if (score >= 40) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    return { level: 'Low', color: 'text-red-400', bg: 'bg-red-600/20' };
  };

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading insights...</span>
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-8">
          <div className="text-center">
            <p className="text-red-400">{statsError}</p>
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activityLevel = getActivityLevel(getActivityScore());
  const recentActivity = getRecentActivity();
  const popularContent = getPopularContent();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 overflow-hidden shadow-xl backdrop-blur-sm">
        {/* Cover Image */}
        <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Cover Image Upload */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cover')}
                className="hidden"
              />
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-gray-800/90 transition-colors border border-gray-600">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </label>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gray-900 rounded-full p-1 shadow-2xl border-4 border-gray-800">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Avatar Upload */}
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                  className="hidden"
                />
                <div className="bg-blue-600 rounded-full p-1.5 sm:p-2 hover:bg-blue-700 transition-colors border-2 border-gray-800">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                {getPlanBadge()}
              </div>
              <p className="text-gray-400 text-sm sm:text-base">@{user?.username}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {coverImage && (
                <button
                  type="button"
                  onClick={handleCoverImageUpdate}
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg border border-green-500/30 font-medium text-sm sm:text-base"
                >
                  Update Cover
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {user?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Bio</h3>
                  <p className="text-white text-base sm:text-lg leading-relaxed">{user.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                  <span className="text-gray-400 font-medium">Email:</span>
                  <p className="text-white mt-1 text-sm sm:text-base">{user?.email}</p>
                </div>
                <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                  <span className="text-gray-400 font-medium">Member since:</span>
                  <p className="text-white mt-1 text-sm sm:text-base">{getMemberSince()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-blue-500/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Posts</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.totalPosts || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">{recentActivity.posts} this month</span>
                {recentActivity.posts > 0 && (
                  <div className="flex items-center gap-1 text-green-400">
                    <ArrowUp className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-xs">+{recentActivity.posts}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-blue-600/20 rounded-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-green-500/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Friends</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.totalFriends || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.totalSentFriendRequests || 0} pending requests
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-600/20 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-purple-500/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Articles</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats?.totalArticles || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">{recentActivity.articles} this month</span>
                {recentActivity.articles > 0 && (
                  <div className="flex items-center gap-1 text-purple-400">
                    <ArrowUp className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-xs">+{recentActivity.articles}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-purple-600/20 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 hover:border-red-500/50 transition-colors backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Engagement</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{getEngagementRate()}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {(stats?.totalPostLikes || 0) + (stats?.totalArticleLikes || 0)} total likes
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-600/20 rounded-lg">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Level Indicator */}
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Activity Level</h3>
          <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${activityLevel.bg} ${activityLevel.color}`}>
            {activityLevel.level}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-gray-400 text-sm sm:text-base">Activity Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getActivityScore()}%` }}
                ></div>
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">{getActivityScore()}/100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <span className="text-gray-400 text-xs sm:text-sm">Member for:</span>
              <p className="text-white font-medium text-sm sm:text-base">{getMemberDuration()}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <span className="text-gray-400 text-xs sm:text-sm">Content rate:</span>
              <p className="text-white font-medium text-sm sm:text-base">{getContentCreationRate()} per week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Engagement Analytics */}
        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Engagement Analytics</h3>
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Engagement Rate</p>
                  <p className="text-gray-400 text-sm">Based on interactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(getEngagementRate(), 50)}`}>
                  {getEngagementRate()}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Eye className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Post Performance</p>
                  <p className="text-gray-400 text-sm">Avg. engagement per post</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(stats?.performance?.engagementPerPost || 0, 5)}`}>
                  {stats?.performance?.engagementPerPost || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Share2 className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Article Performance</p>
                  <p className="text-gray-400 text-sm">Avg. engagement per article</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(stats?.performance?.engagementPerArticle || 0, 10)}`}>
                  {stats?.performance?.engagementPerArticle || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Story Engagement</p>
                  <p className="text-gray-400 text-sm">Total story likes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{stats?.totalStoryLikes || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Activity (30 days)</h3>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Created {recentActivity.posts} posts</p>
                <p className="text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-blue-400 font-semibold">{recentActivity.posts}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Heart className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Liked {recentActivity.likes} posts</p>
                <p className="text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-semibold">{recentActivity.likes}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Published {recentActivity.articles} articles</p>
                <p className="text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-purple-400 font-semibold">{recentActivity.articles}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Liked {recentActivity.storyLikes} stories</p>
                <p className="text-gray-400 text-xs">This month</p>
              </div>
              <div className="text-right">
                <span className="text-yellow-400 font-semibold">{recentActivity.storyLikes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Analytics & Club Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Analytics */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Chat Analytics</h3>
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Active Chats</p>
                  <p className="text-gray-400 text-sm">Unique conversations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">{stats?.chatAnalysis?.totalChats || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <ArrowUp className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Messages Sent</p>
                  <p className="text-gray-400 text-sm">Total outgoing messages</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{stats?.chatAnalysis?.totalMessagesSent || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <ArrowDown className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Messages Received</p>
                  <p className="text-gray-400 text-sm">Total incoming messages</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{stats?.chatAnalysis?.totalMessagesReceived || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <BarChart className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Avg. Messages/Chat</p>
                  <p className="text-gray-400 text-sm">Average per conversation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{getAverageMessagesPerChat()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Club Participation */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Club Participation</h3>
            <Hash className="h-5 w-5 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Member of</p>
                  <p className="text-gray-400 text-sm">Total clubs joined</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">{stats?.totalClubs || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Crown className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Owned Clubs</p>
                  <p className="text-gray-400 text-sm">Clubs you created</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{stats?.ownedClubs || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Leadership Score</p>
                  <p className="text-gray-400 text-sm">Based on owned clubs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">
                  {stats?.ownedClubs > 0 ? Math.min(100, stats.ownedClubs * 25) : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Award className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Community Role</p>
                  <p className="text-gray-400 text-sm">Your participation level</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-400">
                  {stats?.ownedClubs > 2 ? 'Leader' : stats?.totalClubs > 5 ? 'Active' : 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Content Section */}
      {(popularContent.posts.length > 0 || popularContent.articles.length > 0) && (
        <div className="bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 lg:from-gray-800 lg:via-gray-800 lg:to-gray-800 rounded-2xl lg:rounded-xl border border-gray-600/60 lg:border-gray-700 p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Popular Content</h3>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Popular Posts */}
            {popularContent.posts.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Top Posts
                </h4>
                <div className="space-y-3">
                  {popularContent.posts.slice(0, 3).map((post, index) => (
                    <div key={post.id} className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{post.likes.length}</span>
                        </div>
                      </div>
                      <p className="text-white text-sm line-clamp-2">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Articles */}
            {popularContent.articles.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  Top Articles
                </h4>
                <div className="space-y-3">
                  {popularContent.articles.slice(0, 3).map((article, index) => (
                    <div key={article.id} className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1 text-purple-400">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{article.articleLikes.length}</span>
                        </div>
                      </div>
                      <p className="text-white text-sm line-clamp-2">{article.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 mx-auto text-sm sm:text-base"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          Refresh Insights
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 