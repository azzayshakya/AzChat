const crypto = require('crypto');
const { readDB, writeDB } = require('../models/db');
const {
  validateFile,
  saveFileToDisk,
  deleteFileFromDisk,
  getFileCategory,
} = require('../utils/fileUtils');
const { isGroupMember } = require('../utils/groupUtils');

// ─── Get direct messages ──────────────────────────────────────────────────────
function getMessages(req, res) {
  const currentUserId = req.user.userId;
  const { otherUserId } = req.params;
  const db = readDB();

  const chatId = [currentUserId, otherUserId].sort().join('_');

  const msgs = db.messages
    .filter(
      (m) =>
        m.chatId === chatId &&
        m.chatType === 'direct' &&
        !(m.deletedForUsers && m.deletedForUsers.includes(currentUserId))
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return res.json({ data: msgs });
}

// ─── Get group messages ───────────────────────────────────────────────────────
function getGroupMessages(req, res) {
  const currentUserId = req.user.userId;
  const { groupId } = req.params;
  const db = readDB();

  if (!isGroupMember(groupId, currentUserId)) {
    return res.status(403).json({ error: 'You are not a member of this group' });
  }

  const msgs = db.messages
    .filter(
      (m) =>
        m.chatId === groupId &&
        m.chatType === 'group' &&
        !(m.deletedForUsers && m.deletedForUsers.includes(currentUserId))
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return res.json({ data: msgs });
}

// ─── Mark messages as seen ────────────────────────────────────────────────────
function markRead(req, res) {
  const currentUserId = req.user.userId;
  const { fromUserId } = req.body;
  const db = readDB();

  db.messages = db.messages.map((m) => {
    if (m.senderId === fromUserId && m.receiverId === currentUserId && m.status !== 'seen') {
      return { ...m, status: 'seen', isRead: true, seenAt: new Date().toISOString() };
    }
    return m;
  });

  writeDB(db);
  return res.json({ ok: true });
}

// ─── Delete own message ───────────────────────────────────────────────────────
function deleteMessage(req, res) {
  const currentUserId = req.user.userId;
  const { messageId } = req.params;
  const { deleteFor } = req.body; // 'me' | 'everyone'
  const db = readDB();

  const msgIndex = db.messages.findIndex((m) => m.id === messageId);
  if (msgIndex === -1) return res.status(404).json({ error: 'Message not found' });

  const msg = db.messages[msgIndex];
  if (msg.senderId !== currentUserId) {
    return res.status(403).json({ error: 'You can only delete your own messages' });
  }

  if (deleteFor === 'everyone') {
    // Delete physical file from disk if exists
    if (msg.file?.url) deleteFileFromDisk(msg.file.url);

    db.messages[msgIndex] = {
      ...msg,
      text: null,
      file: null,
      deletedAt: new Date().toISOString(),
      deletedFor: 'everyone',
    };
  } else {
    // Soft-delete for current user only — file stays on disk
    const deletedForUsers = msg.deletedForUsers || [];
    if (!deletedForUsers.includes(currentUserId)) deletedForUsers.push(currentUserId);
    db.messages[msgIndex] = { ...msg, deletedForUsers };
  }

  writeDB(db);
  return res.json({ ok: true, messageId });
}

// ─── Upload file message ──────────────────────────────────────────────────────
async function uploadFileMessage(req, res) {
  try {
    const currentUserId = req.user.userId;
    const { receiverId, groupId, caption } = req.body;
    const file = req.file;

    const fileError = validateFile(file);
    if (fileError) return res.status(400).json({ error: fileError });

    if (!receiverId && !groupId) {
      return res.status(400).json({ error: 'receiverId or groupId is required' });
    }

    if (groupId && !isGroupMember(groupId, currentUserId)) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Save to disk — returns { url, mimetype, size }
    const saved = await saveFileToDisk(file);
    const category = getFileCategory(saved.mimetype);

    const isGroup = !!groupId;
    const chatId = isGroup ? groupId : [currentUserId, receiverId].sort().join('_');

    const db = readDB();

    const msg = {
      id: crypto.randomUUID(),
      chatId,
      chatType: isGroup ? 'group' : 'direct',
      senderId: currentUserId,
      receiverId: isGroup ? null : receiverId,
      groupId: isGroup ? groupId : null,
      text: caption?.trim() || null,
      file: {
        name: file.originalname, // original filename for display
        mimetype: saved.mimetype,
        category,
        size: saved.size,
        url: saved.url, // e.g. /uploads/images/abc.webp  — NOT base64
      },
      status: 'sent',
      isRead: false,
      editedAt: null,
      deletedAt: null,
      deletedFor: null,
      deletedForUsers: [],
      seenAt: null,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    writeDB(db);

    return res.status(201).json({ data: msg });
  } catch (error) {
    console.error('[uploadFileMessage]', error);
    return res.status(500).json({ error: 'Failed to process file' });
  }
}

module.exports = {
  getMessages,
  getGroupMessages,
  markRead,
  deleteMessage,
  uploadFileMessage,
};
