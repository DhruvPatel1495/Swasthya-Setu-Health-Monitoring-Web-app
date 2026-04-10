import express from 'express';
import { getContacts, getMessages, getUnreadCount } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread-count', protect, getUnreadCount);
router.get('/contacts', protect, getContacts);
router.get('/:userId', protect, getMessages);

export default router;

