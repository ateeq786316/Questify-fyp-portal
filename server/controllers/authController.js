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
        msg: "A student with this email or roll number is already registered.",
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
          msg: "A signup request for this email is already pending. Please wait for the OTP to expire or check your email for the OTP.",
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
        msg: "You are requesting OTPs too quickly. Please wait a minute before trying again.",
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
        msg: "Could not send verification email. Please ensure the email address is valid and try again.",
      });
    }

    // Update rate limiting
    otpRequests.set(email, now);

    res.status(200).json({ success: true, msg: "OTP sent successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      msg: "Unable to process your signup at this time. Please try again later.",
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
        msg: "Your signup request is invalid or has expired. Please sign up again.",
      });
    }

    // Check OTP expiry
    if (Date.now() > tempSignup.otpExpiry) {
      await TempSignup.deleteOne({ email });
      return res.status(400).json({
        success: false,
        msg: "Your OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (otp !== tempSignup.otp) {
      return res.status(400).json({
        success: false,
        msg: "The OTP you entered is incorrect. Please try again.",
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

    res
      .status(201)
      .json({ success: true, msg: "Account created successfully", token });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      msg: "Unable to verify your OTP at this time. Please try again later.",
    });
  }
};
