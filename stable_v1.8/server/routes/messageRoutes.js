const router = require('express').Router();

const { getMessages, markRead } = require('../controllers/messageController');

const authMiddleware = require('../middleware/authMiddleware');

// Protect routes
router.use(authMiddleware);

// Get messages
router.get('/messages/:otherUserId', getMessages);

// Mark seen
router.patch('/messages/read', markRead);

module.exports = router;
