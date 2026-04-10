import express from 'express';
import { getDoctors, getDoctorById, updateDoctorProfile } from '../controllers/doctorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);
router.put('/profile', protect, updateDoctorProfile); // Assume we map user to doctor logically

export default router;
