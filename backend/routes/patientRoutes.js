import express from 'express';
import { submitVitals, getPatientHistory, getPatients, updatePatient, deletePatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('Doctor', 'Admin'), getPatients);
router.put('/:id', protect, authorize('Doctor', 'Admin'), updatePatient);
router.delete('/:id', protect, authorize('Doctor', 'Admin'), deletePatient);

router.post('/data', protect, submitVitals);
router.get('/history/:id', protect, getPatientHistory);

export default router;
