import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: String,
    default: 'General Health',
  },
  experience: {
    type: Number,
    default: 0,
  },
  pricing: {
    type: Number,
    default: 850,
  },
  bio: {
    type: String,
    default: 'Passionate about providing the best care for patients using modern telemedicine solutions.',
  },
  languages: {
    type: [String],
    default: ['English'],
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  patientsTreated: {
    type: Number,
    default: 0,
  },
  sessionPreferences: {
    video: { type: Boolean, default: true },
    audio: { type: Boolean, default: true },
    chat: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
