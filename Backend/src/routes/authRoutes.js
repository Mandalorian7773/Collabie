import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    register,
    login,
    refresh,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange
} from '../middleware/validationMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100 : 10,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'development' && req.path === '/health';
    }
});

const strictAuthLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 50 : 5,
    message: {
        success: false,
        error: 'Too many attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});


router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);


router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, updateProfile);
router.put('/change-password', authMiddleware, strictAuthLimiter, validatePasswordChange, changePassword);
router.post('/logout-all', authMiddleware, logoutAll);


router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;