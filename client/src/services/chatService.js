import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store/api';

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

const chatService = {
  // Send a message
  sendMessage: async (receiverId, content) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post('/messages', { receiverId, content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Get chat history with a user
  getMessages: async (userId) => {
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/messages?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default chatService; 