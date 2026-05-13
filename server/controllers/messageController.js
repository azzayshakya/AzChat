const { readDB, writeDB } = require('../models/db');

// Get conversation messages
function getMessages(req, res) {
  const currentUserId = req.user.userId;

  const { otherUserId } = req.params;

  const db = readDB();

  const chatId = [currentUserId, otherUserId].sort().join('_');

  const msgs = db.messages.filter((m) => m.chatId === chatId);

  // Sort messages
  msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json({
    data: msgs,
  });
}

// Mark messages as seen
function markRead(req, res) {
  const currentUserId = req.user.userId;

  const { fromUserId } = req.body;

  const db = readDB();

  const chatId = [currentUserId, fromUserId].sort().join('_');

  db.messages = db.messages.map((m) => {
    if (
      m.chatId === chatId &&
      m.senderId === fromUserId &&
      m.receiverId === currentUserId &&
      m.status !== 'seen'
    ) {
      return {
        ...m,

        status: 'seen',

        isRead: true,

        seenAt: new Date().toISOString(),
      };
    }

    return m;
  });

  writeDB(db);

  res.json({
    ok: true,
  });
}

module.exports = {
  getMessages,
  markRead,
};
