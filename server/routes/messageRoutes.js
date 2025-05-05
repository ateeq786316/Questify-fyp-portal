const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth'); // You need to have this middleware

router.post('/', authenticate, sendMessage);
router.get('/', authenticate, getMessages);

module.exports = router;
