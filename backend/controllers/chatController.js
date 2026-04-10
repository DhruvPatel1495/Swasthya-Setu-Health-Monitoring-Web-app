import Message from '../models/Message.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// @desc    Get contacts list for chat (Users you have conversed with + Assigned Doctor/Patients)
export const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    // 1. Find users with existing message history
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) contactIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId.toString()) contactIds.add(msg.receiver.toString());
    });

    // 2. Add "Suggested" contacts based on role
    if (role === 'Doctor') {
      // Find all patients assigned to this doctor
      const myPatients = await Patient.find({ assignedDoctor: userId });
      myPatients.forEach(p => contactIds.add(p.userId.toString()));
    } else if (role === 'Patient') {
      // Find the doctor assigned to this patient
      const myProfile = await Patient.findOne({ userId: userId });
      if (myProfile && myProfile.assignedDoctor) {
        contactIds.add(myProfile.assignedDoctor.toString());
      }
    }

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('-password');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get message history with a specific user
// @route   GET /api/chat/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

