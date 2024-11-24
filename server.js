const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// App setup
const app =  express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware, routes, etc., go here
app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));