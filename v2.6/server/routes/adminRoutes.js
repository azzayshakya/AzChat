const router = require('express').Router();

const {
  getAllUsers,
  makeGetOnlineUsers,
  getChatStats,
  getConnections,
  deleteUser,
  checkAdmin,
  postUserQuery,
  getUserQuery,
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');

const roleMiddleware = require('../middleware/role.middleware');

router.post('/post-user-query', postUserQuery);

module.exports = (getOnlineUsers) => {
  router.use(authMiddleware, roleMiddleware('admin'));

  router.get('/users', getAllUsers);

  router.get('/online-users', makeGetOnlineUsers(getOnlineUsers));

  router.get('/chats', getChatStats);

  router.get('/check', checkAdmin);

  router.get('/connections', getConnections);

  router.get('/get-user-query', getUserQuery);

  router.delete('/users/:userId', deleteUser);

  return router;
};
