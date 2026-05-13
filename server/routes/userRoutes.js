const router = require("express").Router();
const { searchUsers, getContacts } = require("../controllers/userController");

router.get("/users/search", searchUsers);
router.get("/contacts/:userId", getContacts);

module.exports = router;
