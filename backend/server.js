import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { loadConfigFromSSM } from './services/configService.js';
import { initSocket } from './config/socket.js';
import { initVitalsSimulator } from './services/vitalsSimulator.js';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import Message from './models/Message.js';

dotenv.config();

// Load AWS SSM Config if in production (Maximum Cloud Services - Free Tier)
if (process.env.NODE_ENV === 'production') {
  await loadConfigFromSSM();
}

connectDB();

const app = express();
const httpServer = createServer(app);

// CloudWatch-friendly Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(JSON.stringify({
            level: 'info',
            message: `${req.method} ${req.originalUrl}`,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            timestamp: new Date().toISOString()
        }));
    });
    next();
});

// Setup Socket.io
const io = initSocket(httpServer);

// Initialize real-time vitals simulation
initVitalsSimulator();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/aichat', aiChatRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('Swasthya Setu API is running...');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Setup user-specific room
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', async (newMessageReceived) => {
    try {
      const { sender, receiver, content } = newMessageReceived;
      // Save message to DB
      const msg = await Message.create({ sender, receiver, content });
      
      const fullMsg = await Message.findById(msg._id).populate('sender', 'name email').populate('receiver', 'name email');
      
      if (!fullMsg.receiver) return console.log('chat.receiver not defined');
      
      // Emit to receiver's room
      socket.in(receiver).emit('message received', fullMsg);
      // Optional: emit to sender to confirm, but usually optimistic UI is used
      socket.emit('message sent', fullMsg);
    } catch (e) {
      console.log('Message save error:', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
