import express from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus, getAvailableDoctors, getDashboardStats } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/doctors', protect, getAvailableDoctors);
router.get('/stats', protect, getDashboardStats);
router.route('/')
  .post(protect, authorize('Patient'), createAppointment)
  .get(protect, getAppointments);

router.put('/:id/status', protect, updateAppointmentStatus);

export default router;

