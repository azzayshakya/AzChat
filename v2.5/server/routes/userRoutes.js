const router = require('express').Router();

const { searchUsers, getContacts } = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Protect routes
router.use(authMiddleware);

// Search users
router.get('/users/search', searchUsers);

// Get contacts
router.get('/contacts', getContacts);

module.exports = router;
