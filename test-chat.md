# Chat Functionality Test Checklist

## Pre-Test Setup

1. **Environment Files**
   - [ ] Create `.env` file in `client/` directory with:
     ```
     VITE_API_URL=http://localhost:5002/api
     VITE_SOCKET_URL=http://localhost:5002
     ```
   - [ ] Create `.env` file in `server/` directory with:
     ```
     PORT=5002
     DATABASE_URL="your_database_connection_string"
     JWT_SECRET=your-secret-key
     CORS_ORIGIN=http://localhost:5173
     SOCKET_CORS_ORIGIN=http://localhost:5173
     ```

2. **Start Services**
   - [ ] Start server: `cd server && npm run dev`
   - [ ] Start client: `cd client && npm run dev`
   - [ ] Verify server is running on port 5002
   - [ ] Verify client is running on port 5173

## Test Cases

### 1. Socket Connection Test
- [ ] Open browser console
- [ ] Navigate to Chat page
- [ ] Click the 🐛 debug button (development mode only)
- [ ] Verify console shows "Connected to WebSocket server"
- [ ] Verify console shows "User [userId] joined their room"

### 2. Real-time Message Test
- [ ] Open app in two browser windows/tabs
- [ ] Login with different users in each window
- [ ] Navigate to Chat in both windows
- [ ] Select a conversation between the two users
- [ ] Send a message from one window
- [ ] Verify message appears immediately in both windows
- [ ] Check console for "Real-time message received" logs

### 3. Typing Indicator Test
- [ ] In one chat window, start typing in the message input
- [ ] Verify typing indicator appears in the other window
- [ ] Stop typing for 1 second
- [ ] Verify typing indicator disappears
- [ ] Check console for "Typing indicator received" logs

### 4. Message Persistence Test
- [ ] Send several messages between users
- [ ] Refresh both browser windows
- [ ] Navigate back to the same conversation
- [ ] Verify all previous messages are still there

### 5. Error Handling Test
- [ ] Disconnect internet connection
- [ ] Try to send a message
- [ ] Verify error message appears
- [ ] Reconnect internet
- [ ] Verify socket reconnects automatically

## Expected Console Logs

### Successful Connection:
```
Connected to WebSocket server at: http://localhost:5002
User [userId] joined their room
```

### Message Events:
```
Real-time message received: {from: "userId", to: "userId", text: "message", ...}
Chat message received: {from: "userId", to: "userId", text: "message", ...}
```

### Typing Events:
```
Typing indicator received: {from: "userId", to: "userId", isTyping: true}
Typing indicator received: {from: "userId", to: "userId", isTyping: false}
```

## Debug Tools

In development mode, use these debug buttons in the chat header:

- **🐛 Bug Icon**: Tests socket connection and shows status
- **⚡ Lightning Icon**: Emits test socket events
- **👁️ Eye Icon**: Monitors all socket events in console

## Common Issues & Solutions

### Issue: "Socket not connected"
**Solution**: 
1. Check if server is running on port 5002
2. Verify `VITE_SOCKET_URL` is set correctly
3. Check CORS settings in server
4. Ensure user is authenticated

### Issue: "Messages not appearing in real-time"
**Solution**:
1. Check if both users are online
2. Verify socket events are being emitted
3. Check if users are in correct socket rooms
4. Ensure message format is correct

### Issue: "Typing indicators not working"
**Solution**:
1. Verify typing events are being emitted
2. Check if recipient is in correct room
3. Ensure typing timeout is working
4. Check console for typing event logs

## Performance Notes

- Messages should appear instantly (optimistic updates)
- Typing indicators should appear within 100ms
- Socket should reconnect automatically on network issues
- No duplicate messages should appear
- Memory usage should remain stable during long conversations 