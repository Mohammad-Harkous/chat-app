// Middleware for verifying the JWT (JSON Web Token).
// Ensures only authenticated users can access protected routes.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization');

  if(!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded user data to the request object
    req.user = decode;
    // Proceed to the next middleware or route
    next();
  } catch (err) {
    // Handle invalid token
    res.status(400).json({ message: 'Invalid token.' });
  }
};