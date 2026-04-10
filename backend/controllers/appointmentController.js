import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, purpose } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingAppointment = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'cancelled' } });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked for this doctor' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      timeSlot,
      purpose,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'Doctor') {
      appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId', 'name email');
    } else {
      appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId', 'name email');
    }
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'Patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'Doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.user.role === 'Doctor' ? { doctorId: userId } : { patientId: userId };
    
    const now = new Date();
    
    const stats = {
      total: await Appointment.countDocuments(query),
      upcoming: await Appointment.countDocuments({ ...query, date: { $gte: now }, status: { $in: ['confirmed', 'pending'] } }),
      attended: await Appointment.countDocuments({ ...query, status: 'completed' }),
      next: await Appointment.findOne({ ...query, date: { $gte: now }, status: 'confirmed' })
        .sort({ date: 1, timeSlot: 1 })
        .populate(req.user.role === 'Doctor' ? 'patientId' : 'doctorId', 'name email')
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
