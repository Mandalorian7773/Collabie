import Friend from '../models/friendModel.js';
import User from '../models/userModel.js';

class FriendController {
    // Send a friend request
    static async sendFriendRequest(req, res) {
        try {
            const { recipientUsername } = req.body;
            const requesterId = req.user._id;

            if (!recipientUsername) {
                return res.status(400).json({
                    success: false,
                    error: 'Recipient username is required'
                });
            }

            // Find the recipient user
            const recipient = await User.findOne({ 
                username: recipientUsername.toLowerCase() 
            });

            if (!recipient) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const recipientId = recipient._id;

            // Check if already friends
            const existingFriendship = await Friend.findOne({
                $or: [
                    { requester: requesterId, recipient: recipientId },
                    { requester: recipientId, recipient: requesterId }
                ]
            });

            if (existingFriendship) {
                if (existingFriendship.status === 'accepted') {
                    return res.status(400).json({
                        success: false,
                        error: 'You are already friends with this user'
                    });
                } else if (existingFriendship.status === 'pending') {
                    return res.status(400).json({
                        success: false,
                        error: 'Friend request already sent'
                    });
                } else if (existingFriendship.status === 'blocked') {
                    return res.status(400).json({
                        success: false,
                        error: 'Unable to send friend request'
                    });
                }
            }

            // Create friend request
            const friendRequest = new Friend({
                requester: requesterId,
                recipient: recipientId,
                status: 'pending'
            });

            await friendRequest.save();

            // Populate the requester and recipient fields
            await friendRequest.populate('requester', 'username email avatar role');
            await friendRequest.populate('recipient', 'username email avatar role');

            res.status(201).json({
                success: true,
                message: 'Friend request sent successfully',
                friendRequest
            });

        } catch (error) {
            console.error('Send friend request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send friend request',
                details: error.message
            });
        }
    }

    // Accept a friend request
    static async acceptFriendRequest(req, res) {
        try {
            const { requestId } = req.params;
            const userId = req.user._id;

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    error: 'Request ID is required'
                });
            }

            // Find the friend request
            const friendRequest = await Friend.findById(requestId);

            if (!friendRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Friend request not found'
                });
            }

            // Check if the user is the recipient of the request
            if (!friendRequest.recipient.equals(userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to accept this request'
                });
            }

            // Accept the friend request
            await friendRequest.accept();

            // Populate the requester and recipient fields
            await friendRequest.populate('requester', 'username email avatar role');
            await friendRequest.populate('recipient', 'username email avatar role');

            res.json({
                success: true,
                message: 'Friend request accepted',
                friendRequest
            });

        } catch (error) {
            console.error('Accept friend request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to accept friend request',
                details: error.message
            });
        }
    }

    // Decline a friend request
    static async declineFriendRequest(req, res) {
        try {
            const { requestId } = req.params;
            const userId = req.user._id;

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    error: 'Request ID is required'
                });
            }

            // Find the friend request
            const friendRequest = await Friend.findById(requestId);

            if (!friendRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Friend request not found'
                });
            }

            // Check if the user is the recipient of the request
            if (!friendRequest.recipient.equals(userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to decline this request'
                });
            }

            // Decline the friend request
            await friendRequest.decline();

            res.json({
                success: true,
                message: 'Friend request declined'
            });

        } catch (error) {
            console.error('Decline friend request error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to decline friend request',
                details: error.message
            });
        }
    }

    // Get friends list
    static async getFriends(req, res) {
        try {
            const userId = req.user._id;

            const friends = await Friend.getFriends(userId);

            // Transform the friends data to a more user-friendly format
            const transformedFriends = friends.map(friend => {
                // Determine which user is the friend (not the current user)
                const friendUser = friend.requester._id.equals(userId) 
                    ? friend.recipient 
                    : friend.requester;

                return {
                    _id: friend._id,
                    friend: {
                        _id: friendUser._id,
                        username: friendUser.username,
                        email: friendUser.email,
                        avatar: friendUser.avatar,
                        role: friendUser.role,
                        isOnline: friendUser.lastActive && 
                            (Date.now() - new Date(friendUser.lastActive).getTime()) < 5 * 60 * 1000,
                        lastActive: friendUser.lastActive
                    },
                    status: friend.status,
                    createdAt: friend.createdAt,
                    updatedAt: friend.updatedAt
                };
            });

            res.json({
                success: true,
                friends: transformedFriends,
                count: transformedFriends.length
            });

        } catch (error) {
            console.error('Get friends error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve friends',
                details: error.message
            });
        }
    }

    // Get pending friend requests
    static async getPendingRequests(req, res) {
        try {
            const userId = req.user._id;

            const pendingRequests = await Friend.getPendingRequests(userId);

            // Transform the requests data
            const transformedRequests = pendingRequests.map(request => {
                return {
                    _id: request._id,
                    requester: {
                        _id: request.requester._id,
                        username: request.requester.username,
                        email: request.requester.email,
                        avatar: request.requester.avatar,
                        role: request.requester.role,
                        isOnline: request.requester.lastActive && 
                            (Date.now() - new Date(request.requester.lastActive).getTime()) < 5 * 60 * 1000,
                        lastActive: request.requester.lastActive
                    },
                    status: request.status,
                    createdAt: request.createdAt
                };
            });

            res.json({
                success: true,
                pendingRequests: transformedRequests,
                count: transformedRequests.length
            });

        } catch (error) {
            console.error('Get pending requests error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve pending requests',
                details: error.message
            });
        }
    }

    // Remove a friend
    static async removeFriend(req, res) {
        try {
            const { friendId } = req.params;
            const userId = req.user._id;

            if (!friendId) {
                return res.status(400).json({
                    success: false,
                    error: 'Friend ID is required'
                });
            }

            // Find the friendship
            const friendship = await Friend.findOne({
                $or: [
                    { requester: userId, recipient: friendId },
                    { requester: friendId, recipient: userId }
                ],
                status: 'accepted'
            });

            if (!friendship) {
                return res.status(404).json({
                    success: false,
                    error: 'Friendship not found'
                });
            }

            // Delete the friendship
            await Friend.findByIdAndDelete(friendship._id);

            res.json({
                success: true,
                message: 'Friend removed successfully'
            });

        } catch (error) {
            console.error('Remove friend error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove friend',
                details: error.message
            });
        }
    }
}

export default FriendController;