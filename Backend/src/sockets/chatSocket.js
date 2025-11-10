import Message from '../models/messageModel.js';
import initCallSockets from './callSocket.js';

const initSockets = (io) => {
    // Initialize chat sockets
    io.on('connection', (socket) => {
        console.log(`✅ New socket connected: ${socket.id}`);

        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`👤 User ${userId} joined room ${userId}`);
                socket.emit('joined', { userId, message: 'Successfully joined your room' });
            } else {
                console.log('⚠️ Join event received without userId');
            }
        });

        socket.on('test', (data) => {
            console.log('🧪 Test event received:', data);
            socket.emit('testResponse', 'Backend received your test!');
        });

        socket.on('sendMessage', async (data) => {
            try {
                const { sender, receiver, content, messageType = 'text' } = data;

                if (!sender || !receiver || !content) {
                    socket.emit('error', { 
                        message: 'Missing required fields: sender, receiver, and content are required' 
                    });
                    return;
                }

                const message = await Message.create({
                    chatId: receiver,
                    senderId: sender,
                    content,
                    messageType
                });

                console.log(`💬 Message saved: ${sender} → ${receiver}: ${content}`);

                const messageData = {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    messageType: message.messageType,
                    createdAt: message.createdAt,
                    read: message.read
                };

                io.to(receiver).emit('receiveMessage', messageData);
                
                if (sender !== receiver) {
                    io.to(sender).emit('receiveMessage', messageData);
                }

                console.log(`📤 Message emitted to rooms: ${sender}, ${receiver}`);

            } catch (error) {
                console.error('❌ Error saving message:', error);
                socket.emit('error', { 
                    message: 'Failed to send message',
                    details: error.message 
                });
            }
        });

        socket.on('markAsRead', async (data) => {
            try {
                const { chatId, userId } = data;

                if (!chatId || !userId) {
                    socket.emit('error', { 
                        message: 'Chat ID and User ID are required for marking as read' 
                    });
                    return;
                }

                const result = await Message.updateMany(
                    { 
                        senderId: chatId,
                        chatId: userId,
                        read: false
                    },
                    { read: true }
                );

                console.log(`📖 Marked ${result.modifiedCount} messages as read for user ${userId} from ${chatId}`);

                io.to(chatId).emit('messagesMarkedAsRead', {
                    readBy: userId,
                    chatId: chatId,
                    markedCount: result.modifiedCount,
                    timestamp: new Date()
                });

                socket.emit('readStatusUpdated', {
                    success: true,
                    chatId,
                    markedCount: result.modifiedCount
                });

            } catch (error) {
                console.error('❌ Error marking messages as read:', error);
                socket.emit('error', { 
                    message: 'Failed to mark messages as read',
                    details: error.message 
                });
            }
        });

        socket.on('typing', (data) => {
            const { userId, chatId, isTyping } = data;
            if (chatId) {
                socket.to(chatId).emit('userTyping', {
                    userId,
                    isTyping,
                    timestamp: new Date()
                });
            }
        });

        socket.on('updateOnlineStatus', (data) => {
            const { userId, isOnline } = data;

            socket.broadcast.emit('userOnlineStatusChanged', {
                userId,
                isOnline,
                timestamp: new Date()
            });
        });

        socket.on('leave', (userId) => {
            if (userId) {
                socket.leave(userId);
                console.log(`👋 User ${userId} left room ${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error(`🔥 Socket error for ${socket.id}:`, error);
        });

        // Direct call events
        socket.on('start-direct-call', (data) => {
            const { targetUserId, senderUserId, callType } = data;
            
            if (!targetUserId || !senderUserId) {
                socket.emit('call-error', { 
                    message: 'Target user ID and sender user ID are required' 
                });
                return;
            }

            // Notify target user about incoming call
            socket.to(targetUserId).emit('incoming-direct-call', {
                callerUserId: senderUserId,
                callType,
                timestamp: new Date()
            });

            console.log(`📞 Direct call started from ${senderUserId} to ${targetUserId}`);
        });

        socket.on('end-direct-call', (data) => {
            const { targetUserId, senderUserId } = data;
            
            if (!targetUserId || !senderUserId) {
                socket.emit('call-error', { 
                    message: 'Target user ID and sender user ID are required' 
                });
                return;
            }

            // Notify target user about call end
            socket.to(targetUserId).emit('direct-call-ended', {
                callerUserId: senderUserId,
                timestamp: new Date()
            });

            console.log(`📞 Direct call ended between ${senderUserId} and ${targetUserId}`);
        });
    });

    // Initialize call sockets
    initCallSockets(io);

    console.log('🚀 Socket.IO initialized and ready for connections');
};

export default initSockets;