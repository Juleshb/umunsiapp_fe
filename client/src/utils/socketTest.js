// Socket connection test utility
import socketService from '../services/socketService';

export const testSocketConnection = () => {
  console.log('🔌 Testing Socket Connection...');
  
  // Test connection status
  console.log('Connection status:', socketService.getConnectionStatus());
  
  // Test if socket instance exists
  console.log('Socket instance:', socketService.socket ? 'Exists' : 'Missing');
  
  // Test environment variables
  console.log('Environment variables:');
  console.log('- VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
  console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  // Test connection
  if (!socketService.getConnectionStatus()) {
    console.log('⚠️ Socket not connected. Attempting to connect...');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      socketService.connect(token, userData.id);
      
      // Check again after a short delay
      setTimeout(() => {
        console.log('Connection status after connect attempt:', socketService.getConnectionStatus());
      }, 1000);
    } else {
      console.log('❌ No token or user data found');
    }
  } else {
    console.log('✅ Socket is connected');
  }
};

export const testSocketEvents = () => {
  console.log('📡 Testing Socket Events...');
  
  if (!socketService.getConnectionStatus()) {
    console.log('❌ Socket not connected. Cannot test events.');
    return;
  }
  
  // Test emitting a message
  const testMessage = {
    from: 'test-user',
    to: 'test-receiver',
    text: 'Test message',
    content: 'Test message',
    id: `test-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  console.log('Emitting test message:', testMessage);
  socketService.emitChatMessage(testMessage);
  
  // Test typing indicator
  const testTyping = {
    from: 'test-user',
    to: 'test-receiver',
    isTyping: true
  };
  
  console.log('Emitting test typing:', testTyping);
  socketService.emitTyping(testTyping);
  
  // Stop typing after 2 seconds
  setTimeout(() => {
    const stopTyping = { ...testTyping, isTyping: false };
    console.log('Stopping test typing:', stopTyping);
    socketService.emitTyping(stopTyping);
  }, 2000);
};

export const monitorSocketEvents = () => {
  console.log('👀 Monitoring Socket Events...');
  
  // Listen for all events
  const events = ['connect', 'disconnect', 'connect_error', 'chat-message', 'typing', 'user-online'];
  
  events.forEach(event => {
    socketService.on(event, (data) => {
      console.log(`📨 Event received [${event}]:`, data);
    });
  });
  
  console.log('Monitoring active. Check console for events.');
}; 