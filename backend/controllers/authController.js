import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import jwt from 'jsonwebtoken';
import { createPatientNode } from '../services/neo4jService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userRole = role === 'Doctor' ? 'Doctor' : 'Patient';

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    if (user) {
      if (userRole === 'Patient') {
        // Create corresponding MongoDB Patient doc and Neo4j Node
        await Patient.create({ userId: user._id });
        try { await createPatientNode(user._id, user.name); } catch(err) { console.error('Neo4j err:', err.message); }
      } else if (userRole === 'Doctor') {
        await Doctor.create({ userId: user._id });
        // NOTE: Optional - We could also create a Neo4j node for doctors here if we extend graph queries
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      let profileId = null;
      if (user.role === 'Doctor') {
        const doctor = await Doctor.findOne({ userId: user._id });
        profileId = doctor ? doctor._id : null;
      } else if (user.role === 'Patient') {
        const patient = await Patient.findOne({ userId: user._id });
        profileId = patient ? patient._id : null;
      }

      res.json({
        _id: user._id,
        profileId,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  // In a JWT setup, logout is mainly handled client-side by destroying the token
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (me)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      let profileId = null;
      if (user.role === 'Doctor') {
        const doctor = await Doctor.findOne({ userId: user._id });
        profileId = doctor ? doctor._id : null;
      } else if (user.role === 'Patient') {
        const patient = await Patient.findOne({ userId: user._id });
        profileId = patient ? patient._id : null;
      }

      res.json({
        ...user.toObject(),
        profileId
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.password) {
        user.password = req.body.password;
        await user.save();
        res.json({ message: 'Password updated successfully' });
      } else {
         res.status(400).json({ message: 'No new password provided' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
