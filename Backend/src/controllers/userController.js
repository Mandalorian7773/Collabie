import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Friend from '../models/friendModel.js';

export const searchUsers = async (req, res) => {
    try {
        const { username } = req.query;
        const currentUserId = req.user._id;

        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Username query is required'
            });
        }


        const searchQuery = {
            username: { $regex: username, $options: 'i' },
            _id: { $ne: currentUserId }
        };

        const users = await User.find(searchQuery)
            .select('username email avatar role lastActive')
            .limit(10)
            .sort({ username: 1 });

        const transformedUsers = users.map(user => {
            const isOnline = user.lastActive && 
                (Date.now() - new Date(user.lastActive).getTime()) < 5 * 60 * 1000;

            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isOnline,
                lastActive: user.lastActive
            };
        });

        res.status(200).json({
            success: true,
            users: transformedUsers,
            count: transformedUsers.length
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search users'
        });
    }
};


export const getUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const currentUserId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;


        let searchQuery = {
            _id: { $ne: currentUserId }
        };

        if (search) {
            searchQuery.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }


        const users = await User.find(searchQuery)
            .select('username email avatar role lastActive createdAt')
            .sort({ lastActive: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);


        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);

        const transformedUsers = users.map(user => {
            const isOnline = user.lastActive && 
                (Date.now() - new Date(user.lastActive).getTime()) < 5 * 60 * 1000;

            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isOnline,
                lastActive: user.lastActive
            };
        });

        res.status(200).json({
            success: true,
            users: transformedUsers,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve users'
        });
    }
};


export const getConversations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const currentUserId = req.user._id.toString();

        // Get friends
        const friends = await Friend.getFriends(currentUserId);
        
        // Get conversation partners from messages
        const sentMessages = await Message.distinct('chatId', { senderId: currentUserId });
        const receivedMessages = await Message.distinct('senderId', { chatId: currentUserId });
        
        const conversationPartnerIds = [...new Set([...sentMessages, ...receivedMessages])]
            .filter(id => id !== currentUserId);

        // Combine friends and conversation partners
        const allContactIds = [...new Set([
            ...conversationPartnerIds,
            ...friends.map(friend => {
                // Get the friend's ID (not the current user's ID)
                // Since the objects are populated, we need to get the _id property
                const requesterId = friend.requester._id ? friend.requester._id.toString() : friend.requester.toString();
                const recipientId = friend.recipient._id ? friend.recipient._id.toString() : friend.recipient.toString();
                
                return requesterId === currentUserId ? recipientId : requesterId;
            })
        ])];

        if (allContactIds.length === 0) {
            return res.status(200).json({
                success: true,
                conversations: []
            });
        }

        const conversationPartners = await User.find({
            _id: { $in: allContactIds }
        })
        .select('username email avatar role lastActive createdAt');

        const conversationsWithLastMessage = await Promise.all(
            conversationPartners.map(async (partner) => {
                const partnerId = partner._id.toString();
                
                // Get last message if exists
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: currentUserId, chatId: partnerId },
                        { senderId: partnerId, chatId: currentUserId }
                    ]
                })
                .sort({ createdAt: -1 })
                .select('content createdAt senderId messageType');

                // Get unread count
                const unreadCount = await Message.countDocuments({
                    senderId: partnerId,
                    chatId: currentUserId,
                    read: false
                });

                // Check if this is a friend
                const isFriend = friends.some(friend => {
                    const requesterId = friend.requester._id ? friend.requester._id.toString() : friend.requester.toString();
                    const recipientId = friend.recipient._id ? friend.recipient._id.toString() : friend.recipient.toString();
                    return requesterId === partnerId || recipientId === partnerId;
                });

                const isOnline = partner.lastActive && 
                    (Date.now() - new Date(partner.lastActive).getTime()) < 5 * 60 * 1000;

                return {
                    _id: partner._id,
                    username: partner.username,
                    email: partner.email,
                    avatar: partner.avatar,
                    role: partner.role,
                    isOnline,
                    lastActive: partner.lastActive,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        timestamp: lastMessage.createdAt,
                        fromMe: lastMessage.senderId === currentUserId,
                        messageType: lastMessage.messageType
                    } : null,
                    unreadCount,
                    isFriend: isFriend || false
                };
            })
        );

        // Sort by last activity (message or lastActive)
        conversationsWithLastMessage.sort((a, b) => {
            // Prioritize friends without messages
            if (a.isFriend && !a.lastMessage && b.lastMessage) return -1;
            if (b.isFriend && !b.lastMessage && a.lastMessage) return 1;
            
            const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.lastActive || 0);
            const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.lastActive || 0);
            return bTime - aTime;
        });

        res.status(200).json({
            success: true,
            conversations: conversationsWithLastMessage
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversations'
        });
    }
};