import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodType: { type: String },
  medicalHistory: [{ type: String }],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Patient', patientSchema);
