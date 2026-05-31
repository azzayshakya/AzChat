const router = require('express').Router();
const {
  createGroup,
  getMyGroups,
  getGroup,
  updateGroup,
  addMember,
  removeMember,
  promoteMember,
  demoteMember,
  deleteGroup,
} = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/groups', createGroup); // POST   /api/groups
router.get('/groups', getMyGroups); // GET    /api/groups
router.get('/groups/:groupId', getGroup); // GET    /api/groups/:groupId
router.patch('/groups/:groupId', updateGroup); // PATCH  /api/groups/:groupId
router.delete('/groups/:groupId', deleteGroup); // DELETE /api/groups/:groupId

router.post('/groups/:groupId/members', addMember); // POST   /api/groups/:groupId/members
router.delete('/groups/:groupId/members/:userId', removeMember); // DELETE /api/groups/:groupId/members/:userId
router.patch('/groups/:groupId/members/:userId/promote', promoteMember); // PATCH /api/groups/:groupId/members/:userId/promote
router.patch('/groups/:groupId/members/:userId/demote', demoteMember); // PATCH /api/groups/:groupId/members/:userId/demote

module.exports = router;
