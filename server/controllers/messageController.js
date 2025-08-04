// Message Controller
const prisma = require('../utils/database');

module.exports = {
  sendMessage: async (req, res) => {
    try {
      const senderId = req.user.id;
      const { content, receiverId } = req.body;
      if (!content || !receiverId) {
        return res.status(400).json({ success: false, message: 'Content and receiverId are required' });
      }
      const message = await prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
        },
        include: {
          sender: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
          receiver: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
        }
      });

      // Emit socket event for real-time delivery
      const io = req.app.get('io');
      if (io) {
        const messageData = {
          id: message.id,
          from: message.senderId,
          to: message.receiverId,
          text: message.content,
          content: message.content,
          timestamp: message.createdAt,
          sender: message.sender,
          receiver: message.receiver
        };
        
        console.log('Emitting chat-message event:', messageData);
        io.to(`user-${message.senderId}`).emit('chat-message', messageData);
        io.to(`user-${message.receiverId}`).emit('chat-message', messageData);
      }

      res.json({ success: true, data: message });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  },
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;
      const otherUserId = req.query.userId;
      if (!otherUserId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
          receiver: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
        }
      });
      res.json({ success: true, data: messages });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  },
  getChatList: (req, res) => {},
  markAsRead: (req, res) => {},
}; 