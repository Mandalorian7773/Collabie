import axios from 'axios';
import config from '../config/env.js';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


const tokenStorage = {
    getToken: () => localStorage.getItem('accessToken'),
    setToken: (token) => localStorage.setItem('accessToken', token),
    removeToken: () => localStorage.removeItem('accessToken'),
    
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user'),
    
    clear: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }
};


api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshResponse = await api.post('/auth/refresh');
                const { accessToken } = refreshResponse.data.tokens;
                
                tokenStorage.setToken(accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                
                return api(originalRequest);
            } catch (refreshError) {

                tokenStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);


const authService = {

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            
            if (response.data.success) {
                const { user, tokens } = response.data;
                tokenStorage.setToken(tokens.accessToken);
                tokenStorage.setUser(user);
                return { success: true, user, message: response.data.message };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed. Please try again.',
                details: error.response?.data?.details
            };
        }
    },


    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            
            if (response.data.success) {
                const { user, tokens } = response.data;
                tokenStorage.setToken(tokens.accessToken);
                tokenStorage.setUser(user);
                return { success: true, user, message: response.data.message };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed. Please try again.',
                details: error.response?.data?.details
            };
        }
    },


    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            tokenStorage.clear();
        }
    },


    async logoutAll() {
        try {
            await api.post('/auth/logout-all');
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            tokenStorage.clear();
        }
    },


    async getProfile() {
        try {
            const response = await api.get('/auth/me');
            
            if (response.data.success) {
                const { user } = response.data;
                tokenStorage.setUser(user);
                return { success: true, user };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get profile'
            };
        }
    },


    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/profile', profileData);
            
            if (response.data.success) {
                const { user } = response.data;
                tokenStorage.setUser(user);
                return { success: true, user, message: response.data.message };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update profile'
            };
        }
    },


    async changePassword(passwordData) {
        try {
            const response = await api.put('/auth/change-password', passwordData);
            
            if (response.data.success) {
                return { success: true, message: response.data.message };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to change password'
            };
        }
    },


    async getConversations() {
        try {
            const response = await api.get('/users/conversations');
            
            if (response.data.success) {
                return { 
                    success: true, 
                    conversations: response.data.conversations 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get conversations error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get conversations'
            };
        }
    },


    async getUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            
            const response = await api.get(`/users?${queryParams}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    users: response.data.users, 
                    pagination: response.data.pagination 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get users'
            };
        }
    },


    async addUser(username) {
        try {
            const response = await api.post('/users/add', { username });
            
            if (response.data.success) {
                return { 
                    success: true, 
                    user: response.data.user, 
                    message: response.data.message 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Add user error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to add user'
            };
        }
    },


    async searchUsers(username) {
        try {
            const response = await api.get(`/users/search?username=${encodeURIComponent(username)}`);
            
            if (response.data.success) {
                return { 
                    success: true, 
                    users: response.data.users 
                };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Search users error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to search users'
            };
        }
    },


    isAuthenticated() {
        const token = tokenStorage.getToken();
        const user = tokenStorage.getUser();
        return !!(token && user);
    },


    getCurrentUser() {
        return tokenStorage.getUser();
    },


    getCurrentToken() {
        return tokenStorage.getToken();
    },


    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh');
            
            if (response.data.success) {
                const { user, tokens } = response.data;
                tokenStorage.setToken(tokens.accessToken);
                tokenStorage.setUser(user);
                return { success: true, user };
            }
            
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('Token refresh error:', error);
            tokenStorage.clear();
            return {
                success: false,
                error: error.response?.data?.error || 'Session expired'
            };
        }
    }
};


export { api };

export default authService;