import Message from "../models/messageModel.js";


export const sendMessage = async (req, res) => {
    try {
        const { chatId, senderId, content, messageType = 'text' } = req.body;


        if (!chatId || !senderId || !content) {
            return res.status(400).json({ 
                error: 'Missing required fields: chatId, senderId, and content are required' 
            });
        }

        const message = await Message.create({
            chatId,
            senderId,
            content,
            messageType
        });

        return res.status(201).json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message 
        });
    }
};


export const getMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const { page = 1, limit = 50, markRead = true } = req.query;

        if (!userId1 || !userId2) {
            return res.status(400).json({ 
                success: false,
                error: 'Both user IDs are required' 
            });
        }

        const skip = (page - 1) * limit;


        const messages = await Message.find({
            $or: [
                { senderId: userId1, chatId: userId2 },
                { senderId: userId2, chatId: userId1 }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(parseInt(limit))
            .skip(skip);


        if (markRead === 'true' || markRead === true) {
            await Message.updateMany(
                {
                    senderId: userId2,
                    chatId: userId1,
                    read: false
                },
                { read: true }
            );
        }

        const totalMessages = await Message.countDocuments({
            $or: [
                { senderId: userId1, chatId: userId2 },
                { senderId: userId2, chatId: userId1 }
            ]
        });

        return res.status(200).json({
            success: true,
            messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNextPage: skip + messages.length < totalMessages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch messages',
            details: error.message 
        });
    }
};


export const markAsRead = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        if (!chatId || !userId) {
            return res.status(400).json({ 
                success: false,
                error: 'Chat ID and User ID are required' 
            });
        }


        const result = await Message.updateMany(
            { 
                senderId: chatId,
                chatId: userId,
                read: false
            },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to mark messages as read',
            details: error.message 
        });
    }
};


export const getUnreadCount = async (req, res) => {
    try {
        const { chatId, userId } = req.params;

        if (!chatId || !userId) {
            return res.status(400).json({ error: 'Chat ID and User ID are required' });
        }

        const unreadCount = await Message.countDocuments({
            chatId,
            senderId: { $ne: userId },
            read: false
        });

        return res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ 
            error: 'Failed to get unread count',
            details: error.message 
        });
    }
};


export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        if (!messageId || !userId) {
            return res.status(400).json({ error: 'Message ID and User ID are required' });
        }

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }


        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this message' });
        }

        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ 
            error: 'Failed to delete message',
            details: error.message 
        });
    }
};


export const searchMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { query, page = 1, limit = 20 } = req.query;

        if (!chatId || !query) {
            return res.status(400).json({ error: 'Chat ID and search query are required' });
        }

        const skip = (page - 1) * limit;

        const messages = await Message.find({
            chatId,
            content: { $regex: query, $options: 'i' }
        })
            .populate('senderId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const totalMessages = await Message.countDocuments({
            chatId,
            content: { $regex: query, $options: 'i' }
        });

        return res.status(200).json({
            success: true,
            messages,
            searchQuery: query,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNextPage: skip + messages.length < totalMessages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({ 
            error: 'Failed to search messages',
            details: error.message 
        });
    }
};
