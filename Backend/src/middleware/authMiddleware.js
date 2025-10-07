import User from '../models/userModel.js';
import JWTUtils from '../utils/jwtUtils.js';


export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = JWTUtils.extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'NO_TOKEN'
            });
        }


        const decoded = JWTUtils.verifyAccessToken(token);


        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User account is deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }


        user.updateLastActive();


        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.message.includes('jwt expired')) {
            return res.status(401).json({
                success: false,
                error: 'Access token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.message.includes('invalid token') || error.message.includes('Invalid or expired')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid access token',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = JWTUtils.extractTokenFromHeader(authHeader);

        if (!token) {
            return next();
        }

        const decoded = JWTUtils.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id;
            req.userRole = user.role;
            user.updateLastActive();
        }

        next();
    } catch (error) {

        next();
    }
};


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'NO_AUTH'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};


export const adminOnly = authorizeRoles('admin');


export const moderatorOrAdmin = authorizeRoles('moderator', 'admin');


export const ownerOrModerator = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        const isOwner = resourceUserId && req.user._id.toString() === resourceUserId.toString();
        const isModerator = ['moderator', 'admin'].includes(req.user.role);

        if (!isOwner && !isModerator) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Owner or moderator privileges required'
            });
        }

        next();
    };
};

export default authMiddleware;