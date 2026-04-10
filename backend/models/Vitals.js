import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  spo2: { type: Number, required: true },
  anomalyFlag: { type: Boolean, default: false },
  severityScore: { type: Number, default: 0 },
  aiAnalysis: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Vitals', vitalsSchema);
