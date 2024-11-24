const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI,{
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;