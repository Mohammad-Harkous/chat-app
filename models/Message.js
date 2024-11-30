// This schema defines the Message collection, which stores chat messages.
// Each message belongs to a specific chat room and has a sender.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to a chat room
  chatId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Chat',
     required: true
    },
  // Reference to the sender
  sender: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true
    },
  // Message content
  content: {
    type: String,
    required: true
  },
  // Timestamp of message creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});