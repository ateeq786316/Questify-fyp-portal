const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../utils/token");

// Unified auth middleware
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token",
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User not found",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        msg: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
