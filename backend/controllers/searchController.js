import User from '../models/User.js';
import Report from '../models/Report.js';
import Appointment from '../models/Appointment.js';

/**
 * Global search across multiple entities
 * @route GET /api/search?q=...
 */
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ doctors: [], patients: [], reports: [], appointments: [] });
    }

    const regex = new RegExp(q, 'i');
    const userId = req.user._id;
    const userRole = req.user.role;

    const results = {
      doctors: [],
      patients: [],
      reports: [],
      appointments: []
    };

    // 1. Search Users (Doctors/Patients)
    // Doctors/Admins can search all patients.
    // Patients can search all doctors.
    if (userRole === 'Doctor' || userRole === 'Admin') {
      results.patients = await User.find({
        role: 'Patient',
        $or: [{ name: regex }, { email: regex }]
      }).select('name email role').limit(5);
    }
    
    if (userRole === 'Patient' || userRole === 'Admin') {
      results.doctors = await User.find({
        role: 'Doctor',
        $or: [{ name: regex }, { email: regex }]
      }).select('name email role').limit(5);
    }

    // 2. Search Reports
    // Doctors/Admins can search all reports (within privacy rules if any, but currently broad).
    // Patients can only search THEIR reports.
    const reportQuery = { 
      $or: [
        { title: regex },
        { summary: regex }
      ]
    };
    
    if (userRole === 'Patient') {
      reportQuery.patientId = userId;
    } else if (userRole === 'Doctor') {
      // In a real app, maybe only reports for their patients, but let's assume all for now
    }

    results.reports = await Report.find(reportQuery)
      .populate('patientId', 'name')
      .limit(5);

    // 3. Search Appointments
    const appointmentQuery = { purpose: regex };
    if (userRole === 'Patient') {
      appointmentQuery.patientId = userId;
    } else if (userRole === 'Doctor') {
      appointmentQuery.doctorId = userId;
    }

    results.appointments = await Appointment.find(appointmentQuery)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .limit(5);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};
