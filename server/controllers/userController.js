const { readDB } = require("../models/db");

function searchUsers(req, res) {
  const { q, exclude } = req.query;
  const db = readDB();
  const results = db.users
    .filter(
      (u) =>
        u.id !== exclude &&
        u.username.toLowerCase().includes((q || "").toLowerCase()),
    )
    .map((u) => ({ id: u.id, username: u.username, email: u.email }));
  res.json(results);
}

function getContacts(req, res) {
  const { userId } = req.params;
  const db = readDB();

  const partnerIds = [
    ...new Set(
      db.messages
        .filter((m) => m.from === userId || m.to === userId)
        .map((m) => (m.from === userId ? m.to : m.from)),
    ),
  ];

  const contacts = partnerIds
    .map((id) => {
      const u = db.users.find((u) => u.id === id);
      if (!u) return null;
      const thread = db.messages.filter(
        (m) =>
          (m.from === userId && m.to === id) ||
          (m.from === id && m.to === userId),
      );
      const lastMsg = thread.at(-1);
      const unreadCount = thread.filter(
        (m) => m.from === id && m.to === userId && !m.isRead,
      ).length;
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        lastMessage: lastMsg?.text || "",
        lastAt: lastMsg?.createdAt || "",
        unreadCount,
      };
    })
    .filter(Boolean);

  res.json(contacts);
}

module.exports = { searchUsers, getContacts };
