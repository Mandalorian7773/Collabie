import express from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addUser, searchUsers, getUsers, getConversations } from '../controllers/userController.js';

const router = express.Router();

const userLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 200 : 20,
    message: {
        success: false,
        error: 'Too many user operations, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'development' && req.path === '/health';
    }
});

const readLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 500 : 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});


router.use(authMiddleware);

router.get('/', readLimiter, getUsers);

router.get('/conversations', readLimiter, getConversations);

router.get('/search', readLimiter, searchUsers);

router.post('/add', userLimiter, addUser);


router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User service is healthy',
        timestamp: new Date().toISOString()
    });
});

export default router;