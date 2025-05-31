const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Verify SMTP connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"LGU FYP Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "LGU FYP Portal - Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #352897;">Email Verification</h2>
          <p>Thank you for signing up for the LGU FYP Portal. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #352897; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      "Failed to send verification email. Please try again later."
    );
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
