import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import JWTUtils from '../utils/jwtUtils.js';


export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { username, email, password, avatar } = req.body;


        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(409).json({
                success: false,
                error: `User with this ${field} already exists`,
                code: 'USER_EXISTS'
            });
        }


        const user = new User({
            username,
            email,
            password, // Will be hashed by pre-save middleware
            avatar: avatar || ''
        });

        await user.save();

        const deviceInfo = JWTUtils.getDeviceInfo(req);
        const tokens = await JWTUtils.generateTokenPair(user, deviceInfo);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: user.getPublicProfile(),
            tokens: {
                accessToken: tokens.accessToken,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { identifier, password } = req.body;


        const user = await User.findByEmailOrUsername(identifier);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }


        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }


        await user.updateLastActive();

        const deviceInfo = JWTUtils.getDeviceInfo(req);
        const tokens = await JWTUtils.generateTokenPair(user, deviceInfo);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: user.getPublicProfile(),
            tokens: {
                accessToken: tokens.accessToken,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token required',
                code: 'NO_REFRESH_TOKEN'
            });
        }


        const result = await JWTUtils.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            user: result.user,
            tokens: {
                accessToken: result.accessToken,
                expiresIn: result.expiresIn,
                tokenType: result.tokenType
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        

        res.clearCookie('refreshToken', { path: '/api/auth' });

        if (error.message.includes('Invalid or expired refresh token')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Token refresh failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (refreshToken) {

            await JWTUtils.revokeRefreshToken(refreshToken);
        }

        res.clearCookie('refreshToken', { path: '/api/auth' });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const logoutAll = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }


        await JWTUtils.revokeAllUserTokens(req.user._id);

        res.clearCookie('refreshToken', { path: '/api/auth' });

        res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully'
        });

    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout from all devices failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        res.status(200).json({
            success: true,
            user: req.user.getPublicProfile()
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { username, avatar } = req.body;
        const updateData = {};

        if (username && username !== req.user.username) {

            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: req.user._id } 
            });
            
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Username already taken',
                    code: 'USERNAME_TAKEN'
                });
            }
            updateData.username = username;
        }

        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser.getPublicProfile()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }


        const user = await User.findById(req.user._id).select('+password');
        

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }


        user.password = newPassword;
        await user.save();


        await JWTUtils.revokeAllUserTokens(user._id);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please log in again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};