// Controller for handling user authentication.
// Includes methods for user registration and login.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Register a new user
exports.register = async (req, res) => {
  try{
    // Extract user details from request body
    const {username, email, password} = req.body;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user instance
    const user = new User({ username, email, passwordHash: hashedPassword});
    // Save the user to the database
    await user.save();
    // Respond with success
    res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    // Handle errors
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
};

// Log in an existing user
exports.login = async (req, res) => {
  try{
    // Extract email and password from request body
    const { email, password} = req.body;
    // Find user by email
    const user = await User.findOne({email});
    // Handle user not found
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    // Handle invalid credentials
    if(!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign({ id: user._id, username: user.username}, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Respond with the token
    res.status(200).json({ token });
  } catch (err) {
    // Handle errors
    res.status(400).json({ message: 'Error logging in', error: err.message });
  }
}
