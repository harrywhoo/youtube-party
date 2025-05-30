import mongoose from 'mongoose';

// Define the schema for a party room
const partySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Generate a random 6-character code
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  host: {
    type: String,
    required: true
  },
  currentVideo: {
    id: String,
    title: String,
    timestamp: Number
  },
  members: [{
    id: String,
    name: String,
    isHost: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Party model
export const Party = mongoose.model('Party', partySchema); 