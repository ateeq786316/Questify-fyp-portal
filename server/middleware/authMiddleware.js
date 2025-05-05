// Verify JWT tokens
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "LGU2021197E");

    // Check if user exists and is admin
    const user = await User.findOne({ _id: decoded.id, role: "admin" });

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized as admin",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Admin auth middleware error:", err);
    res.status(401).json({
      success: false,
      msg: "Token is not valid",
    });
  }
};
