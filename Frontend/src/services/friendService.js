import { api } from './authService';

const friendService = {
    async sendFriendRequest(recipientUsername) {
        try {
            const response = await api.post('/api/friends/request', { recipientUsername });
            
            if (response.data.success) {
                return { 
                    success: true, 
                    friendRequest: response.data.friendRequest,
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Send friend request error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send friend request'
            };
        }
    },

    async acceptFriendRequest(requestId) {
        try {
            const response = await api.post(`/api/friends/accept/${requestId}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Accept friend request error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to accept friend request'
            };
        }
    },

    async declineFriendRequest(requestId) {
        try {
            const response = await api.post(`/api/friends/decline/${requestId}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Decline friend request error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to decline friend request'
            };
        }
    },

    async getFriends() {
        try {
            const response = await api.get('/api/friends');
            
            if (response.data.success) {
                return { 
                    success: true, 
                    friends: response.data.friends,
                    count: response.data.count
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get friends error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get friends'
            };
        }
    },

    async getPendingRequests() {
        try {
            const response = await api.get('/api/friends/pending');
            
            if (response.data.success) {
                return { 
                    success: true, 
                    pendingRequests: response.data.pendingRequests,
                    count: response.data.count
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get pending requests error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get pending requests'
            };
        }
    },

    async removeFriend(friendId) {
        try {
            const response = await api.delete(`/api/friends/${friendId}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Remove friend error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to remove friend'
            };
        }
    }
};

export default friendService;