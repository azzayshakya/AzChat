const validator = require('validator');

// Validate register data
function validateRegisterData({ username, email, password }) {
  // Required checks
  if (!username || !email || !password) {
    return 'All fields are required';
  }

  // Normalize username/email
  username = username.trim().toLowerCase();
  email = email.trim().toLowerCase();

  // Username validation
  const usernameRegex = /^[a-z0-9]+$/;

  if (username.length < 3 || username.length > 15) {
    return 'Username must be between 3 and 15 characters';
  }

  if (!usernameRegex.test(username)) {
    return 'Username can contain only letters and numbers';
  }

  // Email validation
  if (!validator.isEmail(email)) {
    return 'Invalid email format';
  }

  // Password validation
  if (password.length < 3) {
    return 'Password must be at least 3 characters long';
  }

  return null;
}

module.exports = {
  validateRegisterData,
};
