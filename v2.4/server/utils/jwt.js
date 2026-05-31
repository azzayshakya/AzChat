const jwt = require('jsonwebtoken');

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id, // Added userId
      role: user.role, // Added role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d', // ENV based expiry
    }
  );
}

module.exports = {
  generateToken,
};
