import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                
                const result = await authService.getProfile();
                if (!result.success) {
                    await logout();
                }
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            const result = await authService.login(credentials);
            
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true, message: result.message };
            }
            
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const result = await authService.register(userData);
            
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true, message: result.message };
            }
            
            return { success: false, error: result.error, details: result.details };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const logoutAll = async () => {
        try {
            setLoading(true);
            await authService.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const result = await authService.updateProfile(profileData);
            
            if (result.success) {
                setUser(result.user);
                return { success: true, message: result.message };
            }
            
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const result = await authService.changePassword(passwordData);
            
            if (result.success) {
                await logout();
                return { success: true, message: result.message };
            }
            
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: 'Failed to change password' };
        }
    };

    const refreshUser = async () => {
        try {
            const result = await authService.getProfile();
            
            if (result.success) {
                setUser(result.user);
                return { success: true, user: result.user };
            }
            
            await logout();
            return { success: false, error: result.error };
        } catch (error) {
            console.error('Refresh user error:', error);
            await logout();
            return { success: false, error: 'Session expired' };
        }
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isModerator = () => {
        return ['moderator', 'admin'].includes(user?.role);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        
        login,
        register,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        refreshUser,
        
        hasRole,
        hasAnyRole,
        isAdmin,
        isModerator,
        
        authService
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;