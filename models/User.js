// This schema defines the structure of the User collection in MongoDB.
// It includes fields for the username, email, hashed password, and creation date.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Unique username
  username: {
    type: String,
    required: true,
    unique: true
  },
  // Unique email address
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Hashed password for security
  passwordHash:{
    type: String,
    required: true
   },
  // Timestamp of user creation
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the User model
module.exports = mongoose.model('User', userSchema);