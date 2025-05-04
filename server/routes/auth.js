const express = require('express');
const router = express.Router();
const { studentLogin, adminLogin } = require('../controllers/auth_Controller');

router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);

module.exports = router; 