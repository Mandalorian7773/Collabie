import express from 'express';
import {
    sendMessage,
    getMessages,
    markAsRead,
    getUnreadCount
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);

router.get('/:userId1/:userId2', getMessages);

router.put('/read', markAsRead);

router.get('/unread/:chatId/:userId', getUnreadCount);

export default router;