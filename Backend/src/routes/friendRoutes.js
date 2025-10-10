import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import FriendController from '../controllers/friendController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST routes
router.post('/request', FriendController.sendFriendRequest);
router.post('/accept/:requestId', FriendController.acceptFriendRequest);
router.post('/decline/:requestId', FriendController.declineFriendRequest);

// GET routes
router.get('/', FriendController.getFriends);
router.get('/pending', FriendController.getPendingRequests);

// DELETE routes
router.delete('/:friendId', FriendController.removeFriend);

export default router;