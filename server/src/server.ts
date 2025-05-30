import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import partyRoutes from './routes/party';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Configure appropriately for production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/party', partyRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a party room
  socket.on('joinParty', (partyCode) => {
    socket.join(partyCode);
    console.log(`User ${socket.id} joined party ${partyCode}`);
  });

  // Leave a party room
  socket.on('leaveParty', (partyCode) => {
    socket.leave(partyCode);
    console.log(`User ${socket.id} left party ${partyCode}`);
  });

  // Handle video synchronization
  socket.on('videoUpdate', (data) => {
    const { partyCode, videoId, timestamp, title } = data;
    socket.to(partyCode).emit('videoUpdate', { videoId, timestamp, title });
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    const { partyCode, message, user } = data;
    io.to(partyCode).emit('chatMessage', { message, user, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-party')
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  }); 