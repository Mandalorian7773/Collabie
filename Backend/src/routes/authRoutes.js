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

// Completely disable rate limiting for development/testing
const authLimiter = (req, res, next) => next();
const strictAuthLimiter = (req, res, next) => next();

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