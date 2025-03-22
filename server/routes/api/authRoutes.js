// routes/api/authRoutes.js
const express = require("express");
const router = express.Router();
const { studentLogin, getStudentDetails, chatbot } = require("../../controllers/auth_Controller");

// Student Login Route
router.post("/student/login", studentLogin);
// router.post("/student/login", (req, res, next) => {next();}, studentLogin);

// Get Student Details Route
router.get("/student/details", getStudentDetails);

// Chatbot Route
router.post("/student/chatbot", chatbot);


module.exports = router;
