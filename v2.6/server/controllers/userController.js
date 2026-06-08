const { readDB, writeDB } = require("../models/db");

// ─── Search users ─────────────────────────────────────────────────────────────
function searchUsers(req, res) {
  const currentUserId = req.user.userId;
  const { q } = req.query;

  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: "Query param `q` is required" });
  }

  const query = q.trim().toLowerCase();
  const db = readDB();

  const results = db.users
    .filter(
      (u) =>
        u.id !== currentUserId &&
        (u.username.includes(query) || u.name.toLowerCase().includes(query)),
    )
    .map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
    }));

  return res.json({ data: results });
}

// ─── Get user profile ─────────────────────────────────────────────────────────
function getUserProfile(req, res) {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.params.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    },
  });
}

// ─── Get all contacts (users who have chatted with current user) ──────────────
function getContacts(req, res) {
  const currentUserId = req.user.userId;
  const db = readDB();

  // Collect all unique user IDs the current user has exchanged messages with
  const contactIds = new Set();
  db.messages.forEach((m) => {
    if (m.deletedForUsers && m.deletedForUsers.includes(currentUserId)) return;
    if (m.chatType !== "direct") return;

    if (m.senderId === currentUserId) contactIds.add(m.receiverId);
    if (m.receiverId === currentUserId) contactIds.add(m.senderId);
  });

  const contacts = db.users
    .filter((u) => contactIds.has(u.id))
    .map((u) => {
      const chatId = [currentUserId, u.id].sort().join("_");
      const msgs = db.messages
        .filter(
          (m) =>
            m.chatId === chatId &&
            m.chatType === "direct" &&
            !(m.deletedForUsers && m.deletedForUsers.includes(currentUserId)),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const lastMessage = msgs[0] || null;
      const unreadCount = msgs.filter(
        (m) => m.receiverId === currentUserId && !m.isRead,
      ).length;

      return {
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen,
        lastMessage,
        unreadCount,
      };
    });

  return res.json({ data: contacts });
}

// ─── Delete contact (clear chat history for current user) ────────────────────
function deleteContact(req, res) {
  const currentUserId = req.user.userId;
  const { contactId } = req.params;
  const db = readDB();

  const chatId = [currentUserId, contactId].sort().join("_");

  // Soft-delete: mark messages as deleted for this user only
  db.messages = db.messages.map((m) => {
    if (m.chatId === chatId && m.chatType === "direct") {
      const deletedForUsers = m.deletedForUsers || [];
      if (!deletedForUsers.includes(currentUserId)) {
        deletedForUsers.push(currentUserId);
      }
      return { ...m, deletedForUsers };
    }
    return m;
  });

  writeDB(db);

  return res.json({ message: "Chat history cleared" });
}

module.exports = { searchUsers, getUserProfile, getContacts, deleteContact };
