const User = require("../models/User");
const TempSignup = require("../models/TempSignup");
const { generateOTP, sendOTPEmail } = require("../utils/emailService");
const jwt = require("jsonwebtoken");

// Rate limiting for OTP requests
const otpRequests = new Map();

// Student signup
exports.studentSignup = async (req, res) => {
  try {
    const { rollNumber, name, email, password, department, batch, contact } =
      req.body;

    // Check if email or roll number already exists in User collection
    const existingStudent = await User.findOne({
      $or: [{ email }, { studentId: rollNumber }],
      role: "student",
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        msg: "Email or Roll Number already registered",
      });
    }

    // Check if there's a pending signup
    const existingTempSignup = await TempSignup.findOne({
      $or: [{ email }, { rollNumber }],
    });

    // If there's a pending signup, check if OTP has expired
    if (existingTempSignup) {
      const now = new Date();
      if (now < existingTempSignup.otpExpiry) {
        return res.status(400).json({
          success: false,
          msg: "A signup request is already pending. Please wait for the OTP to expire or check your email.",
        });
      } else {
        // If OTP has expired, delete the old record
        await TempSignup.deleteOne({ email });
      }
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = otpRequests.get(email);
    if (lastRequest && now - lastRequest < 60000) {
      // 1 minute cooldown
      return res.status(429).json({
        success: false,
        msg: "Please wait before requesting another OTP",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary signup record
    const tempSignup = new TempSignup({
      rollNumber,
      name,
      email,
      password,
      department,
      batch,
      contact,
      otp,
      otpExpiry,
    });

    await tempSignup.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      await TempSignup.deleteOne({ email });
      return res.status(500).json({
        success: false,
        msg: "Failed to send verification email",
      });
    }

    // Update rate limiting
    otpRequests.set(email, now);

    res.status(200).json({
      success: true,
      msg: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in signup process",
    });
  }
};

// Verify OTP and create student account
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find temporary signup
    const tempSignup = await TempSignup.findOne({ email });
    if (!tempSignup) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired signup request",
      });
    }

    // Check OTP expiry
    if (Date.now() > tempSignup.otpExpiry) {
      await TempSignup.deleteOne({ email });
      return res.status(400).json({
        success: false,
        msg: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otp !== tempSignup.otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    // Create student account using User model
    const student = new User({
      name: tempSignup.name,
      email: tempSignup.email,
      password: tempSignup.password,
      department: tempSignup.department,
      contact: tempSignup.contact,
      role: "student",
      studentId: tempSignup.rollNumber,
      program: tempSignup.batch,
      projectStatus: "Pending",
      proposalStatus: "Pending",
    });

    await student.save();

    // Delete temporary signup
    await TempSignup.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      msg: "Account created successfully",
      token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      msg: "Error in verification process",
    });
  }
};
