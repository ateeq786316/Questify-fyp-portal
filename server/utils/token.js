// # JWT generation and verification
const jwt = require('jsonwebtoken');

const SECRET_KEY = "LGU2021197E"; // Move this to an environment variable in production

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } 
  catch (error) {
    return null; // Return null if verification fails
  }
};

module.exports = { generateToken, verifyToken };
