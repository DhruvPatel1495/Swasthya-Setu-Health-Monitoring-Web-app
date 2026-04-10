import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const addDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Adding Doctors...');

    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctors = [
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@test.com',
        specialization: 'Cardiology',
        experience: 8,
        pricing: 850,
        bio: 'Specialist in cardiovascular diseases and preventive heart care.',
        languages: ['English', 'Hindi', 'Gujarati'],
        rating: 4.9,
      },
      {
        name: 'Dr. Amit Patel',
        email: 'amit.patel@test.com',
        specialization: 'Neurology',
        experience: 8,
        pricing: 850,
        bio: 'Focused on comprehensive neurological care and advanced diagnostics.',
        languages: ['English', 'Hindi'],
        rating: 4.8,
      },
      {
        name: 'Dr. Sarah Smith',
        email: 'sarah.smith@test.com',
        specialization: 'Pediatrics',
        experience: 8,
        pricing: 850,
        bio: 'Dedicated pediatrician with special interest in early childhood development.',
        languages: ['English', 'Spanish'],
        rating: 5.0,
      }
    ];

    for (const doc of newDoctors) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: doc.email });
      if (existingUser) {
        console.log(`Doctor ${doc.name} already exists. Updating profile...`);
        await Doctor.updateOne(
          { userId: existingUser._id },
          { $set: {
              specialization: doc.specialization,
              experience: doc.experience,
              pricing: doc.pricing,
              bio: doc.bio,
              languages: doc.languages,
              rating: doc.rating
            }
          }
        );
        continue;
      }

      // 1. Create User
      // Bypass the pre-save hook by using insertMany or updating password hash directly
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: password, // The pre-save hook in User model will hash it
        role: 'Doctor'
      });

      // 2. Create Doctor Profile
      await Doctor.create({
        userId: user._id,
        specialization: doc.specialization,
        experience: doc.experience,
        pricing: doc.pricing,
        bio: doc.bio,
        languages: doc.languages,
        rating: doc.rating,
      });
      console.log(`Successfully added ${doc.name}`);
    }

    console.log('Finished adding additional doctors.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to add doctors:', error);
    process.exit(1);
  }
};

addDoctors();
