const router = require('express').Router();

const {
  postStatus,
  getStatusFeed,
  getMyStatuses,
  viewStatus,
  getStatusViewers,
  deleteStatus,
  cleanupExpiredStatuses,
} = require('../controllers/statusController');

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadRateLimiter } = require('../middleware/rateLimitMiddleware');

// All status routes require authentication
router.use(authMiddleware);

// ─── Feed & own ──────────────────────────────────────────────────────────────
router.get('/statuses', getStatusFeed); // GET  /api/statuses
router.get('/statuses/me', getMyStatuses); // GET  /api/statuses/me

// ─── Post (with optional media) ──────────────────────────────────────────────
router.post(
  '/statuses',
  uploadRateLimiter,
  upload.single('file'), // field name: "file" (optional)
  postStatus
); // POST /api/statuses

// ─── Interactions ─────────────────────────────────────────────────────────────
router.post('/statuses/:statusId/view', viewStatus); // POST /api/statuses/:statusId/view
router.get('/statuses/:statusId/viewers', getStatusViewers); // GET  /api/statuses/:statusId/viewers
router.delete('/statuses/cleanup', cleanupExpiredStatuses); // DELETE /api/statuses/cleanup
router.delete('/statuses/:statusId', deleteStatus); // DELETE /api/statuses/:statusId

// ─── Internal / admin cleanup ─────────────────────────────────────────────────

module.exports = router;
