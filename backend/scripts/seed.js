import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing test data and orphaned records
    await User.deleteMany({ email: { $in: ['doctor@test.com', 'patient@test.com', 'aditya@test.com'] } });
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    
    const password = 'password123';

    // 1. Create Doctor: Dr. Rajesh Kumar
    const doctorUser = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'doctor@test.com',
      password: password,
      role: 'Doctor'
    });

    await Doctor.create({ userId: doctorUser._id, experience: 8 });

    // 2. Create Patient 1: Rohan Sharma
    const patientUser = await User.create({
      name: 'Rohan Sharma',
      email: 'patient@test.com',
      password: password,
      role: 'Patient'
    });

    const patientDoc = await Patient.create({
      userId: patientUser._id,
      assignedDoctor: doctorUser._id,
      age: 45,
      gender: 'Male',
      bloodType: 'A+',
      riskLevel: 'Medium'
    });

    // 3. Create Patient 2: Aditya Singh (the Indian patient)
    const indianPatientUser = await User.create({
      name: 'Aditya Singh',
      email: 'aditya@test.com',
      password: password,
      role: 'Patient'
    });

    const indianPatientDoc = await Patient.create({
      userId: indianPatientUser._id,
      assignedDoctor: doctorUser._id,
      age: 32,
      gender: 'Male',
      bloodType: 'O+',
      riskLevel: 'High'
    });

    // 3. Create Test Appointments
    const today = new Date();
    await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      date: today,
      timeSlot: '10:00 AM',
      status: 'confirmed',
      purpose: 'Monthly Heart Rate Checkup',
      type: 'Video'
    });

    await Appointment.create({
      patientId: indianPatientUser._id,
      doctorId: doctorUser._id,
      date: today,
      timeSlot: '11:00 AM',
      status: 'confirmed',
      purpose: 'Follow-up on Hypertension',
      type: 'Clinic'
    });

    console.log('-----------------------------------------------');
    console.log('Seeding Successful!');
    console.log('Doctor Login: doctor@test.com / password123');
    console.log('Patient Login: patient@test.com / password123');
    console.log('-----------------------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seed();
