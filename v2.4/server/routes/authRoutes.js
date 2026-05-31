const router = require('express').Router();

const {
  register,
  login,
  logout,
  checkUsername,
  checkEmail,
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Auth routes
router.post('/register', authRateLimiter, register);

router.post('/login', authRateLimiter, login);

router.post('/logout', authMiddleware, logout);

router.get('/check-username/:username', checkUsername);

router.get('/check-email/:email', checkEmail);

module.exports = router;
