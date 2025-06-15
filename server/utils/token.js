// # JWT generation and verification
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Use environment variable for JWT secret
const SECRET_KEY = process.env.JWT_SECRET || "LGU2021197E"; // Fallback for development only

// Generate JWT Token
const generateToken = (user) => {
  if (!user || !user._id || !user.role) {
    throw new Error("Invalid user data for token generation");
  }

  return jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
