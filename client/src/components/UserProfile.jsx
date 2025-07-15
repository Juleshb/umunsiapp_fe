import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit3, Save, X, Crown, GraduationCap } from 'lucide-react';
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
        setStatsError('Failed to load statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    
    const updateData = { ...formData };
    if (avatar) {
      updateData.avatar = avatar;
    }

    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditing(false);
      setAvatar(null);
      setAvatarPreview('');
    }
  };

  const handleCoverImageUpdate = async () => {
    if (coverImage) {
      const result = await updateCoverImage(coverImage);
      if (result.success) {
        setCoverImage(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatar(null);
    setAvatarPreview('');
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  };

  const getPlanBadge = () => {
    if (user?.isStudent) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <GraduationCap className="w-4 h-4 mr-1" />
          Student Premium
        </span>
      );
    }
    
    if (user?.plan === 'PREMIUM') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <Crown className="w-4 h-4 mr-1" />
          Premium
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Free Plan
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Cover Image Upload */}
          <div className="absolute top-4 right-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cover')}
                className="hidden"
              />
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </label>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
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
                    <span className="text-white font-bold text-3xl">
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
                <div className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-6 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 text-lg">@{user?.username}</p>
              <div className="mt-3">
                {getPlanBadge()}
              </div>
            </div>
            
            <button
              onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span className="font-medium">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span className="font-medium">Save Changes</span>
                </button>
                
                {coverImage && (
                  <button
                    type="button"
                    onClick={handleCoverImageUpdate}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm font-medium"
                  >
                    Update Cover
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {user?.bio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  <p className="text-gray-900 text-lg leading-relaxed">{user.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <p className="text-gray-900 mt-1">{user?.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-600 font-medium">Member since:</span>
                  <p className="text-gray-900 mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
        </div>
      </div>

      {/* Profile Statistics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Profile Statistics</h2>
        {statsLoading ? (
          <div>Loading statistics...</div>
        ) : statsError ? (
          <div className="text-red-500">{statsError}</div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-600">{stats.totalPosts}</span>
              <span className="text-gray-700 mt-2">Total Posts</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-purple-600">{stats.totalArticles}</span>
              <span className="text-gray-700 mt-2">Total Articles</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-green-600">{stats.totalFriends}</span>
              <span className="text-gray-700 mt-2">Total Friends</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-yellow-600">{stats.totalSentFriendRequests}</span>
              <span className="text-gray-700 mt-2">Sent Friend Requests (Pending)</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center md:col-span-2">
              <span className="text-lg font-semibold text-gray-800 mb-1">Most Liked Article</span>
              {stats.mostLikedArticle ? (
                <>
                  <span className="font-bold text-blue-700">{stats.mostLikedArticle.title}</span>
                  <span className="text-gray-600">Likes: {stats.mostLikedArticle.articleLikes.length}</span>
                </>
              ) : (
                <span className="text-gray-500">No articles yet</span>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center md:col-span-2">
              <span className="text-lg font-semibold text-gray-800 mb-1">Recent Articles</span>
              {stats.recentArticles && stats.recentArticles.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {stats.recentArticles.map(a => (
                    <li key={a.id}>{a.title}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">No recent articles</span>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center md:col-span-2">
              <span className="text-lg font-semibold text-gray-800 mb-1">Chat Analysis</span>
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-blue-600">{stats.chatAnalysis.totalChats}</span>
                  <span className="text-gray-700">Total Chats</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-600">{stats.chatAnalysis.totalMessagesSent}</span>
                  <span className="text-gray-700">Messages Sent</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-purple-600">{stats.chatAnalysis.totalMessagesReceived}</span>
                  <span className="text-gray-700">Messages Received</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfile; 