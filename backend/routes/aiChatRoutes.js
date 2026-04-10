import express from 'express';
import { chatWithAi } from '../controllers/aiChatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, chatWithAi);

export default router;
