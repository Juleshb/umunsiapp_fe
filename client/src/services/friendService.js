import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

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

const friendService = {
  // Send friend request
  sendFriendRequest: async (receiverId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/friends/request', { receiverId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put(`/friends/request/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requestId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.put(`/friends/request/${requestId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel friend request
  cancelFriendRequest: async (requestId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/friends/request/${requestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.delete(`/friends/${friendId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get friends list
  getFriends: async (page = 1, limit = 20) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/friends?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get friend requests
  getFriendRequests: async (type = 'received') => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/friends/requests?type=${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default friendService; 