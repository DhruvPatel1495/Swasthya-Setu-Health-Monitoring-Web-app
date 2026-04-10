import Vitals from '../models/Vitals.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { analyzeVitals, detectAnomaly } from '../services/aiService.js';
import { emitVitalsUpdate, emitAlert } from '../services/socketService.js';
import { recordAnomaly } from '../services/neo4jService.js';
import { sendHealthAlert } from '../services/sesService.js';

// @desc    Get all patients
// @route   GET /api/patient
// @access  Private (Doctor)
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('userId', 'name email role');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a patient
// @route   PUT /api/patient/:id
// @access  Private (Doctor)
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    Object.assign(patient, req.body);
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a patient
// @route   DELETE /api/patient/:id
// @access  Private (Doctor)
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    await User.findByIdAndDelete(patient.userId);
    await Patient.findByIdAndDelete(req.params.id);
    await Vitals.deleteMany({ patientId: patient.userId });

    res.json({ message: 'Patient removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit new vitals data
// @route   POST /api/patient/data
// @access  Private
export const submitVitals = async (req, res) => {
  const { heartRate, temperature, spo2 } = req.body;
  // Use patientId from body as fallback, but priority is req.user._id (User ID)
  const userId = req.body.patientId || req.user?._id;

  try {
    // Find the Patient document corresponding to this User
    const patient = await Patient.findOne({ userId });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found for this user' });

    const { isAnomaly, severityScore } = detectAnomaly(heartRate, temperature, spo2);
    let aiAnalysis = "Normal vitals, no detailed analysis required.";
    
    if (isAnomaly || Math.random() < 0.2) {
      aiAnalysis = await analyzeVitals(heartRate, temperature, spo2);
    }

    const vitals = await Vitals.create({
      patientId: patient._id, // Save Patient model ID
      heartRate,
      temperature,
      spo2,
      anomalyFlag: isAnomaly,
      severityScore,
      aiAnalysis
    });

    // Emit using userId (User model ID) so frontend socket listeners (Dashboard/DoctorDashboard) match easily
    emitVitalsUpdate(userId, vitals);
    
    if (isAnomaly) {
      emitAlert(userId, { message: 'Abnormal vitals detected!', severityScore, aiAnalysis });
      try { 
        await recordAnomaly(userId, severityScore, 'Vitals Anomaly'); 
        // Send email alert via SES (Free Tier)
        const user = await User.findById(userId);
        if (user && user.email) {
            await sendHealthAlert(user.email, user.name, aiAnalysis);
        }
      } catch(e) {
        console.error("Delayed anomaly actions failed:", e.message);
      }
    }

    res.status(201).json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient vitals history
// @route   GET /api/patient/history/:id
// @access  Private
export const getPatientHistory = async (req, res) => {
  try {
    const vitals = await Vitals.find({ patientId: req.params.id }).sort({ timestamp: -1 }).limit(50);
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
