const router = require('express').Router();
const {
  getMessages,
  getGroupMessages,
  markRead,
  deleteMessage,
  uploadFileMessage,
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadRateLimiter } = require('../middleware/rateLimitMiddleware');

router.use(authMiddleware);

router.get('/messages/:otherUserId', getMessages); // GET /api/messages/:otherUserId
router.get('/groups/:groupId/messages', getGroupMessages); // GET /api/groups/:groupId/messages
router.patch('/messages/read', markRead); // PATCH /api/messages/read
router.delete('/messages/:messageId', deleteMessage); // DELETE /api/messages/:messageId

// File upload - single file field named "file"
router.post('/messages/file', uploadRateLimiter, upload.single('file'), uploadFileMessage); // POST /api/messages/file

module.exports = router;
