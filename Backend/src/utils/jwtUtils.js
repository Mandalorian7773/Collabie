import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/refreshTokenModel.js';

class JWTUtils {
    static generateAccessToken(user) {
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        return jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET,
            { 
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
                issuer: 'collabie-chat',
                audience: 'collabie-users'
            }
        );
    }

    static generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }

    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
                issuer: 'collabie-chat',
                audience: 'collabie-users'
            });
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    static async generateTokenPair(user, deviceInfo = {}) {
        const accessToken = this.generateAccessToken(user);
        const refreshTokenString = this.generateRefreshToken();
        
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

        await RefreshToken.createToken(
            user._id,
            refreshTokenString,
            refreshTokenExpiry,
            deviceInfo
        );

        return {
            accessToken,
            refreshToken: refreshTokenString,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            tokenType: 'Bearer'
        };
    }

    static async refreshAccessToken(refreshTokenString) {
        const refreshToken = await RefreshToken.findValidToken(refreshTokenString);
        
        if (!refreshToken) {
            throw new Error('Invalid or expired refresh token');
        }

        if (!refreshToken.userId.isActive) {
            throw new Error('User account is deactivated');
        }

        await refreshToken.markAsUsed();

        const accessToken = this.generateAccessToken(refreshToken.userId);
        const newRefreshTokenString = this.generateRefreshToken();
        
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

        await RefreshToken.createToken(
            refreshToken.userId._id,
            newRefreshTokenString,
            refreshTokenExpiry,
            refreshToken.deviceInfo
        );

        return {
            accessToken,
            refreshToken: newRefreshTokenString,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            tokenType: 'Bearer',
            user: refreshToken.userId.getPublicProfile()
        };
    }

    static async revokeRefreshToken(refreshTokenString) {
        return await RefreshToken.revokeToken(refreshTokenString);
    }

    static async revokeAllUserTokens(userId) {
        return await RefreshToken.revokeAllForUser(userId);
    }

    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    static getDeviceInfo(req) {
        return {
            userAgent: req.get('User-Agent') || '',
            ip: req.ip || req.connection.remoteAddress || '',
            device: req.get('X-Device-Type') || 'unknown'
        };
    }
}

export default JWTUtils;