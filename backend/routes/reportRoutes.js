import express from 'express';
import multer from 'multer';
import { generateReport, getReports, uploadReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/generate/:patientId', protect, authorize('Doctor', 'Admin'), generateReport);
router.post('/upload', protect, upload.single('report'), uploadReport);
router.get('/', protect, getReports);

export default router;
