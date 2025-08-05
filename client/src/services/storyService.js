import axios from 'axios';
import socketService from './socketService';

const API_URL = import.meta.env.VITE_API_URL || 'https://umuhuza.store/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const storyService = {
  // Create a new story
  async createStory(storyData) {
    try {
      const formData = new FormData();
      
      if (storyData.content) {
        formData.append('content', storyData.content);
      }
      
      if (storyData.image) {
        formData.append('story', storyData.image);
      }

      const response = await api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryCreated(response.data.data);
      }

      return response.data;
    } catch (error) {
      console.error('Create story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create story');
    }
  },

  // Get all stories
  async getAllStories() {
    try {
      const response = await api.get('/stories');
      return response.data;
    } catch (error) {
      console.error('Get stories error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch stories');
    }
  },

  // Get story by ID
  async getStoryById(id) {
    try {
      const response = await api.get(`/stories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch story');
    }
  },

  // Update story
  async updateStory(id, storyData) {
    try {
      const formData = new FormData();
      
      if (storyData.content) {
        formData.append('content', storyData.content);
      }
      
      if (storyData.image) {
        formData.append('story', storyData.image);
      }

      const response = await api.put(`/stories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryUpdated(response.data.data);
      }

      return response.data;
    } catch (error) {
      console.error('Update story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update story');
    }
  },

  // Delete story
  async deleteStory(id) {
    try {
      const response = await api.delete(`/stories/${id}`);

      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        socketService.emitStoryDeleted(id);
      }

      return response.data;
    } catch (error) {
      console.error('Delete story error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete story');
    }
  },

  // Like/Unlike story
  async toggleStoryLike(id) {
    try {
      const response = await api.post(`/stories/${id}/like`);

      // Emit WebSocket event for real-time updates
      if (response.data.success && socketService.getConnectionStatus()) {
        if (response.data.data.liked) {
          socketService.emitStoryLiked(id);
        } else {
          socketService.emitStoryUnliked(id);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Toggle story like error:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle story like');
    }
  },

  // Get story likes
  async getStoryLikes(id) {
    try {
      const response = await api.get(`/stories/${id}/likes`);
      return response.data;
    } catch (error) {
      console.error('Get story likes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get story likes');
    }
  },
};

export default storyService;
