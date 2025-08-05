import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token, userId) {
    if (this.socket && this.isConnected) {
      return;
    }

    // Use separate socket URL or fallback to API URL without /api
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
                     (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://umuhuza.store');

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server at:', socketUrl);
      this.isConnected = true;
      
      // Join user to their personal room
      if (userId) {
        this.socket.emit('join-user', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    // Set up story event listeners
    this.setupStoryListeners();

    if (typeof window !== 'undefined' && this.socket) {
      this.socket.onAny((event, ...args) => {
        console.log('Socket event received:', event, args);
      });
    }
  }

  setupStoryListeners() {
    // Listen for new stories
    this.socket.on('new-story', (storyData) => {
      console.log('New story received:', storyData);
      this.notifyListeners('new-story', storyData);
    });

    // Listen for story updates
    this.socket.on('story-updated', (storyData) => {
      console.log('Story updated:', storyData);
      this.notifyListeners('story-updated', storyData);
    });

    // Listen for story deletions
    this.socket.on('story-deleted', (storyId) => {
      console.log('Story deleted:', storyId);
      this.notifyListeners('story-deleted', storyId);
    });

    // Listen for story likes
    this.socket.on('story-liked', (data) => {
      console.log('Story liked:', data);
      this.notifyListeners('story-liked', data);
    });

    // Listen for story unlikes
    this.socket.on('story-unliked', (data) => {
      console.log('Story unliked:', data);
      this.notifyListeners('story-unliked', data);
    });

    // Listen for chat messages
    this.socket.on('chat-message', (messageData) => {
      console.log('Chat message received:', messageData);
      this.notifyListeners('chat-message', messageData);
    });

    // Listen for typing indicators
    this.socket.on('typing', (typingData) => {
      console.log('Typing indicator received:', typingData);
      this.notifyListeners('typing', typingData);
    });

    // Listen for user online status
    this.socket.on('user-online', (userData) => {
      console.log('User online status received:', userData);
      this.notifyListeners('user-online', userData);
    });

    // Listen for article like updates (real-time likes)
    this.socket.on('article-like-updated', (data) => {
      console.log('Article like updated:', data);
      this.notifyListeners('article-like-updated', data);
    });

    // Listen for article comment updates (real-time comments)
    this.socket.on('article-comment-updated', (data) => {
      console.log('Article comment updated:', data);
      this.notifyListeners('article-comment-updated', data);
    });

    // Listen for post like updates (real-time likes)
    this.socket.on('post-like-updated', (data) => {
      console.log('Post like updated:', data);
      this.notifyListeners('post-like-updated', data);
    });

    // Listen for post comment updates (real-time comments)
    this.socket.on('post-comment-updated', (data) => {
      console.log('Post comment updated:', data);
      this.notifyListeners('post-comment-updated', data);
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Emit story creation
  emitStoryCreated(storyData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('story-created', storyData);
    }
  }

  // Emit story update
  emitStoryUpdated(storyData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('story-updated', storyData);
    }
  }

  // Emit story deletion
  emitStoryDeleted(storyId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('story-deleted', storyId);
    }
  }

  emitStoryLiked(storyId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('story-liked', { storyId });
    }
  }

  emitStoryUnliked(storyId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('story-unliked', { storyId });
    }
  }

  // Emit chat message
  emitChatMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat-message', messageData);
    }
  }

  // Emit typing indicator
  emitTyping(typingData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', typingData);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 