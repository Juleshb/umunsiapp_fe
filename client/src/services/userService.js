import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store/api';

// Create axios instance with auth token
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const userService = {
  // Search users
  searchUsers: async (query, page = 1, limit = 10) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put('/users/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get profile statistics
  getProfileStatistics: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/profile/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get suggested friends
  getSuggestedFriends: async () => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/users/suggested-friends');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suggested friends:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default userService; 