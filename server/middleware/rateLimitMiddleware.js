const rateLimit = require('express-rate-limit');

// Auth rate limiter
const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,

  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,

  message: {
    error: 'Too many requests, please try again later',
  },

  standardHeaders: true,

  legacyHeaders: false,
});
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many file uploads. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authRateLimiter, uploadRateLimiter };
