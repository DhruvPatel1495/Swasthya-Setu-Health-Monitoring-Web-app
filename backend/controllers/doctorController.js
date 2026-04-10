import Doctor from '../models/Doctor.js';

// @desc    Get all doctors for marketplace
// @route   GET /api/doctors
// @access  Public or Private (depending on preference)
export const getDoctors = async (req, res) => {
  try {
    const filters = {};
    if (req.query.specialization) {
      filters.specialization = req.query.specialization;
    }

    const doctors = await Doctor.find(filters)
      .populate('userId', 'name email')
      .exec();

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single doctor by id
// @route   GET /api/doctors/:id
// @access  Public or Private
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email');

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found for this user' });
    }

    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.bio = req.body.bio || doctor.bio;
    doctor.experience = req.body.experience !== undefined ? req.body.experience : doctor.experience;
    doctor.pricing = req.body.pricing !== undefined ? req.body.pricing : doctor.pricing;
    doctor.languages = req.body.languages || doctor.languages;
    if (req.body.sessionPreferences) {
      doctor.sessionPreferences = {
         ...doctor.sessionPreferences,
         ...req.body.sessionPreferences
      };
    }

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
