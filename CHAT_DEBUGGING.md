# Real-Time Chat Debugging Guide

This guide helps you troubleshoot and test the real-time chat functionality in the Chart App.

## Issues Fixed

### 1. Socket Connection Issues
- **Problem**: Socket service was hardcoded to connect to `http://localhost:5002` instead of using environment variables
- **Fix**: Updated `socketService.js` to use `VITE_SOCKET_URL` environment variable
- **Location**: `client/src/services/socketService.js`

### 2. Missing Typing Indicator Implementation
- **Problem**: Typing indicators were set up but not actually emitting events
- **Fix**: Added `handleTyping` function in `ChatWindow.jsx` that emits typing events
- **Location**: `client/src/components/ChatWindow.jsx`

### 3. Message Format Inconsistency
- **Problem**: Server and client expected different message formats
- **Fix**: Standardized message format and updated both client and server handling
- **Location**: `client/src/components/ChatWindow.jsx` and `server/controllers/messageController.js`

### 4. Missing Real-time Message Emission
- **Problem**: Server wasn't emitting socket events when messages were saved to database
- **Fix**: Added socket emission in `messageController.js` after successful message save
- **Location**: `server/controllers/messageController.js`

## Environment Setup

### Client Environment (.env)
Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5002/api

# Socket Configuration
VITE_SOCKET_URL=http://localhost:5002

# App Configuration
VITE_APP_NAME=Chart App
VITE_APP_VERSION=1.0.0
```

### Server Environment (.env)
Create a `.env` file in the `server` directory:

```env
PORT=5002
DATABASE_URL="your_database_connection_string"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
API_URL=http://localhost:5002
```

## Testing the Chat Functionality

### 1. Start the Application

```bash
# Terminal 1 - Start the server
cd server
npm install
npm run dev

# Terminal 2 - Start the client
cd client
npm install
npm run dev
```

### 2. Debug Tools (Development Only)

In development mode, you'll see debug buttons in the chat header:

- **🐛 Bug Icon**: Test socket connection
- **⚡ Lightning Icon**: Test socket events
- **👁️ Eye Icon**: Monitor all socket events

### 3. Manual Testing Steps

1. **Open the app** in two different browser windows/tabs
2. **Login with different users** in each window
3. **Navigate to Chat** in both windows
4. **Select a conversation** between the two users
5. **Send messages** and verify they appear in real-time
6. **Type in the message input** and verify typing indicators appear

### 4. Console Debugging

Open browser console and look for these log messages:

#### Successful Connection:
```
Connected to WebSocket server at: http://localhost:5002
User [userId] joined their room
```

#### Message Events:
```
Real-time message received: {from: "userId", to: "userId", text: "message", ...}
Chat message received: {from: "userId", to: "userId", text: "message", ...}
```

#### Typing Events:
```
Typing indicator received: {from: "userId", to: "userId", isTyping: true}
```

## Common Issues and Solutions

### Issue: Messages not appearing in real-time
**Solution**: 
1. Check if socket is connected (use debug button)
2. Verify environment variables are set correctly
3. Check server console for socket connection logs
4. Ensure both users are online

### Issue: Typing indicators not working
**Solution**:
1. Verify typing events are being emitted (check console)
2. Check if the recipient is in the correct socket room
3. Ensure typing timeout is working (1 second delay)

### Issue: Socket connection fails
**Solution**:
1. Verify server is running on port 5002
2. Check CORS settings in server
3. Ensure `VITE_SOCKET_URL` is set correctly
4. Check if firewall is blocking the connection

### Issue: Messages not saving to database
**Solution**:
1. Check database connection
2. Verify JWT token is valid
3. Check server logs for database errors
4. Ensure message controller is working

## Socket Event Flow

### Sending a Message:
1. User types message and clicks send
2. Client emits `chat-message` event via socket
3. Client sends HTTP POST to `/api/messages`
4. Server saves message to database
5. Server emits `chat-message` event to both sender and receiver
6. Both clients receive the message and update UI

### Typing Indicator:
1. User starts typing
2. Client emits `typing` event with `isTyping: true`
3. Recipient receives typing event and shows indicator
4. After 1 second of no typing, client emits `typing` event with `isTyping: false`
5. Recipient hides typing indicator

## File Structure

```
client/src/
├── components/
│   ├── ChatWindow.jsx          # Main chat interface
│   └── ChatList.jsx            # Chat list with real-time updates
├── services/
│   ├── socketService.js        # Socket connection management
│   └── chatService.js          # HTTP API calls for messages
├── utils/
│   └── socketTest.js           # Debug utilities
└── pages/
    └── Chat.jsx                # Chat page with debug tools

server/
├── controllers/
│   └── messageController.js    # Message handling with socket emission
├── index.js                    # Socket.IO setup and event handling
└── routes/
    └── messageRoutes.js        # Message API routes
```

## Performance Considerations

- Messages are sent optimistically (appear immediately in UI)
- Failed messages are removed from UI and error is shown
- Typing indicators have a 1-second debounce to prevent spam
- Socket connection is maintained throughout the session
- Messages are cached in component state for better performance

## Security Notes

- Socket connections require valid JWT token
- Users can only join their own room (`user-${userId}`)
- Messages are validated on both client and server
- User authentication is checked for all message operations 