import express from 'express';
import CallController from '../controllers/callController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET routes
router.get('/room/:roomId', CallController.getActiveCallsByRoom);
router.get('/user/:userId', CallController.getActiveCallsByUser);

// POST routes
router.post('/start', CallController.startCall);
router.post('/join/:callId', CallController.joinCall);
router.post('/leave/:callId', CallController.leaveCall);
router.post('/end/:callId', CallController.endCall);

export default router;