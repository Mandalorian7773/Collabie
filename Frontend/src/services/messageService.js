import { api } from './authService.js';

const messageService = {
    async sendMessage(messageData) {
        try {
            const response = await api.post('/api/messages', messageData);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Send message error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send message'
            };
        }
    },

    async getMessages(userId1, userId2, options = {}) {
        try {
            const { page = 1, limit = 50, markRead = true } = options;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                markRead: markRead.toString()
            });
            
            const response = await api.get(`/api/messages/${userId1}/${userId2}?${queryParams}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    messages: response.data.messages,
                    pagination: response.data.pagination
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get messages error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get messages'
            };
        }
    },

    async markAsRead(chatId, userId) {
        try {
            const response = await api.put('/api/messages/read', { chatId, userId });
            
            if (response.data.success) {
                return { 
                    success: true, 
                    modifiedCount: response.data.modifiedCount 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Mark as read error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to mark messages as read'
            };
        }
    },

    async getUnreadCount(chatId, userId) {
        try {
            const response = await api.get(`/api/messages/unread/${chatId}/${userId}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    unreadCount: response.data.unreadCount 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get unread count error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get unread count'
            };
        }
    }
};

export default messageService;