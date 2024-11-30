// This schema defines the Chat collection, which represents chat rooms.
// It can be either one-on-one or group chats, and includes members and optional group names.

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Type of chat
  type: {
    type: String,
    enum: ['one-on-one', 'group'],
    required: true
  },
  // Array of user references
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  // Group name for group chats
  groupName: {
    type: String
  },
  // Timestamp of chat creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Chat model
module.exports = mongoose.model('Chat', chatSchema); // Export the Chat model
