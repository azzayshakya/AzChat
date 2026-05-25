const { readDB } = require('../models/db');

// Search users
function searchUsers(req, res) {
  const currentUserId = req.user.userId;

  const { q } = req.query;

  const db = readDB();

  const results = db.users
    .filter(
      (u) => u.id !== currentUserId && u.username.toLowerCase().includes((q || '').toLowerCase())
    )
    .map((u) => ({
      id: u.id,

      username: u.username,

      email: u.email,

      role: u.role,

      isOnline: u.isOnline,

      lastSeen: u.lastSeen,
    }));

  res.json(results);
}

// Get contacts
function getContacts(req, res) {
  // Current authenticated user
  const currentUserId = req.user.userId;

  const db = readDB();

  // Safety fallback
  db.messages = db.messages || [];

  db.users = db.users || [];

  const partnerIds = [
    ...new Set(
      db.messages
        .filter((m) => m.senderId === currentUserId || m.receiverId === currentUserId)
        .map((m) => (m.senderId === currentUserId ? m.receiverId : m.senderId))
    ),
  ];

  const contacts = partnerIds
    .map((id) => {
      const user = db.users.find((u) => u.id === id);

      if (!user) return null;

      // Shared chat id
      const chatId = [currentUserId, id].sort().join('_');

      // Thread
      const thread = db.messages
        .filter((m) => m.chatId === chatId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const lastMsg = thread[thread.length - 1];

      // Unread count
      const unreadCount = thread.filter(
        (m) => m.senderId === id && m.receiverId === currentUserId && m.status !== 'seen'
      ).length;

      return {
        id: user.id,

        username: user.username,

        role: user.role,

        isOnline: user.isOnline,

        lastSeen: user.lastSeen,

        lastMessage: lastMsg?.text || '',

        lastAt: lastMsg?.createdAt || '',

        unreadCount,
      };
    })
    .filter(Boolean);

  // Latest chats first
  contacts.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));

  res.json({
    data: contacts,
  });
}

module.exports = {
  searchUsers,
  getContacts,
};
