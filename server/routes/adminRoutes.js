const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_controller');
const { isAdmin } = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', isAdmin, adminController.getDashboardStats);

// Get student groups
router.get('/student-groups', isAdmin, adminController.getStudentGroups);

// Get milestones
router.get('/milestones', isAdmin, adminController.getMilestones);

// Save milestones
router.post('/milestones', isAdmin, adminController.saveMilestones);

module.exports = router; 