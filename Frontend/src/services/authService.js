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
        
        // Check if the error is due to an expired token and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Use the full URL for refresh to avoid baseURL prefix issues
                const refreshResponse = await axios.post(
                    `${config.API_BASE_URL}/api/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const { accessToken } = refreshResponse.data.tokens;
                
                tokenStorage.setToken(accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                tokenStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);


// Separate function definitions to avoid minification issues
async function register(userData) {
    try {
        const response = await api.post('/api/auth/register', userData);
        
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
}

async function login(credentials) {
    try {
        const response = await api.post('/api/auth/login', credentials);
        
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
}

async function logout() {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        tokenStorage.clear();
    }
}

async function logoutAll() {
    try {
        await api.post('/api/auth/logout-all');
    } catch (error) {
        console.error('Logout all error:', error);
    } finally {
        tokenStorage.clear();
    }
}

async function getProfile() {
    try {
        const response = await api.get('/api/auth/me');
        
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
}

async function updateProfile(profileData) {
    try {
        const response = await api.put('/api/auth/profile', profileData);
        
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
}

async function changePassword(passwordData) {
    try {
        const response = await api.put('/api/auth/change-password', passwordData);
        
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
}

// Add the missing getConversations function
async function getConversations() {
    try {
        const response = await api.get('/api/users/conversations');
        
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
}

async function refreshToken() {
    try {
        // Use axios directly to avoid baseURL prefix issues
        const response = await axios.post(
            `${config.API_BASE_URL}/api/auth/refresh`,
            {},
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
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

const authService = {

    isAuthenticated: function() {
        return !!tokenStorage.getToken();
    },

    getCurrentUser: function() {
        return tokenStorage.getUser();
    },

    register: function(userData) {
        return register(userData);
    },

    login: function(credentials) {
        return login(credentials);
    },

    logout: function() {
        return logout();
    },

    logoutAll: function() {
        return logoutAll();
    },

    getProfile: function() {
        return getProfile();
    },

    updateProfile: function(profileData) {
        return updateProfile(profileData);
    },

    changePassword: function(passwordData) {
        return changePassword(passwordData);
    },

    getConversations: function() {
        return getConversations();
    },

    refreshToken: function() {
        return refreshToken();
    }
};


export const getAuthToken = () => {
    return tokenStorage.getToken();
};

export { api };

export default authService;