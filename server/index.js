const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const onlineUsers = require('./utils/onlineUsers');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to routes
app.set('io', io);

// Register API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ChatApp API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    onlineUsers.add(userId);
    socket.userId = userId; // Track for disconnect
    // Broadcast online status
    io.emit('user-online', { userId, isOnline: true });
    console.log(`User ${userId} joined their room`);
  });

  // Real-time chat message relay
  socket.on('chat-message', (data) => {
    console.log('Socket received chat-message:', data);
    io.to(`user-${data.to}`).emit('chat-message', data);
    console.log('Emitted chat-message to recipient:', data.to);
    io.to(`user-${data.from}`).emit('chat-message', data); // echo to sender
    console.log('Emitted chat-message to sender:', data.from);
  });

  // Handle story creation
  socket.on('story-created', (storyData) => {
    // Broadcast to all connected users except the sender
    socket.broadcast.emit('new-story', storyData);
    console.log('New story broadcasted:', storyData.id);
  });

  // Handle story update
  socket.on('story-updated', (storyData) => {
    // Broadcast to all connected users
    io.emit('story-updated', storyData);
    console.log('Story update broadcasted:', storyData.id);
  });

  // Handle story deletion
  socket.on('story-deleted', (storyId) => {
    // Broadcast to all connected users
    io.emit('story-deleted', storyId);
    console.log('Story deletion broadcasted:', storyId);
  });

  // Handle private messages
  socket.on('private_message', (data) => {
    const { receiverId, message } = data;
    io.to(`user_${receiverId}`).emit('new_message', {
      senderId: socket.userId,
      message,
      timestamp: new Date()
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    // data: { to, from, isTyping }
    io.to(`user-${data.to}`).emit('typing', data);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      // Broadcast offline status
      io.emit('user-online', { userId: socket.userId, isOnline: false });
    }
    console.log('User disconnected:', socket.id);
  });
});

module.exports.onlineUsers = onlineUsers;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler (must be last, no path pattern)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
}); 