const crypto = require('crypto');
const { readDB, writeDB } = require('../models/db');

const MAX_STATUS_TEXT_LENGTH = parseInt(process.env.MAX_STATUS_TEXT_LENGTH) || 280;
const MAX_STATUSES_PER_USER = parseInt(process.env.MAX_STATUSES_PER_USER) || 10;
const STATUS_EXPIRY_HOURS = parseInt(process.env.STATUS_EXPIRY_HOURS) || 24;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpired(createdAt) {
  const expiryMs = STATUS_EXPIRY_HOURS * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() > expiryMs;
}

function stripExpired(statuses) {
  return statuses.filter((s) => !isExpired(s.createdAt));
}

// ─── Post a status ────────────────────────────────────────────────────────────
// POST /api/statuses
async function postStatus(req, res, next) {
  try {
    const currentUserId = req.user.userId;
    const { text, backgroundColor, textColor, privacy } = req.body;
    console.log('azx', req.body);
    const file = req.file; // optional — handled by uploadMiddleware

    if (!text && !file) {
      return res.status(400).json({ error: 'Status must have text or a media file' });
    }

    if (text && text.trim().length > MAX_STATUS_TEXT_LENGTH) {
      return res.status(400).json({
        error: `Status text cannot exceed ${MAX_STATUS_TEXT_LENGTH} characters`,
      });
    }

    const db = readDB();

    if (!db.statuses) db.statuses = [];

    // Enforce per-user limit (after expiry cleanup)
    const activeUserStatuses = db.statuses.filter(
      (s) => s.userId === currentUserId && !isExpired(s.createdAt)
    );

    if (activeUserStatuses.length >= MAX_STATUSES_PER_USER) {
      return res.status(400).json({
        error: `You can only have ${MAX_STATUSES_PER_USER} active statuses at a time`,
      });
    }

    // Handle optional file (image / video)
    let filePayload = null;
    if (file) {
      const { saveFileToDisk, validateFile, getFileCategory } = require('../utils/fileUtils');

      const fileError = validateFile(file);
      if (fileError) return res.status(400).json({ error: fileError });

      const category = getFileCategory(file.mimetype);
      if (!['image', 'video'].includes(category)) {
        return res.status(400).json({ error: 'Status media must be an image or video' });
      }

      const saved = await saveFileToDisk(file);
      filePayload = {
        name: file.originalname,
        mimetype: saved.mimetype,
        category,
        size: saved.size,
        url: saved.url,
      };
    }

    const expiresAt = new Date(Date.now() + STATUS_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    let visibleTo = [];

    if (privacy === 'friends') {
      const contacts = new Set();

      (db.messages || []).forEach((m) => {
        if (m.chatType !== 'direct') return;

        // Skip deleted chats for the status owner
        if (m.deletedForUsers?.includes(currentUserId)) return;

        if (m.senderId === currentUserId) {
          contacts.add(m.receiverId);
        }

        if (m.receiverId === currentUserId) {
          contacts.add(m.senderId);
        }
      });

      visibleTo = [...contacts].map((userId) => {
        const user = db.users.find((u) => u.id === userId);

        return {
          userId,
          username: user?.username,
          name: user?.name,
        };
      });
    }
    const status = {
      id: crypto.randomUUID(),
      userId: currentUserId,
      text: text?.trim() || null,
      file: filePayload,
      visibleTo,
      backgroundColor: backgroundColor || process.env.DEFAULT_STATUS_BG || '#1a1540',
      textColor: textColor || process.env.DEFAULT_STATUS_TEXT_COLOR || '#ffffff',
      viewers: [], // [{ userId, viewedAt }]
      createdAt: new Date().toISOString(),
      privacy: privacy,
      expiresAt,
    };

    db.statuses.push(status);
    writeDB(db);

    return res.status(201).json({ data: status });
  } catch (error) {
    next(error);
  }
}

// ─── Get statuses feed (contacts only) ───────────────────────────────────────
// GET /api/statuses
function getStatusFeed(req, res) {
  const currentUserId = req.user.userId;
  const db = readDB();

  if (!db.statuses) return res.json({ data: [] });

  // Collect contact IDs (users current user has chatted with)
  const contactIds = new Set();
  (db.messages || []).forEach((m) => {
    if (m.chatType !== 'direct') return;
    if (m.deletedForUsers?.includes(currentUserId)) return;
    if (m.senderId === currentUserId) contactIds.add(m.receiverId);
    if (m.receiverId === currentUserId) contactIds.add(m.senderId);
  });

  // Include own statuses too
  contactIds.add(currentUserId);

  const activeStatuses = stripExpired(db.statuses);

  // Group by user
  const grouped = {};
  activeStatuses
    .filter((s) => {
      // Own status
      if (s.userId === currentUserId) {
        return true;
      }

      // Public
      if (s.privacy === 'public') {
        return true;
      }

      // Friends
      // Friends
      if (s.privacy === 'friends') {
        return s.visibleTo?.some((user) => user.userId === currentUserId);
      }

      return false;
    })
    .forEach((s) => {
      if (!grouped[s.userId]) {
        const user = db.users.find((u) => u.id === s.userId);
        grouped[s.userId] = {
          user: user
            ? {
                id: user.id,
                username: user.username,
                name: user.name,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
              }
            : { id: s.userId },
          statuses: [],
          latestAt: null,
          allSeen: true,
        };
      }

      const alreadySeen = s.viewers.some((v) => v.userId === currentUserId);
      if (!alreadySeen && s.userId !== currentUserId) grouped[s.userId].allSeen = false;

      grouped[s.userId].statuses.push({
        ...s,
        viewers: s.userId === currentUserId ? s.viewers : undefined, // only own statuses expose viewers
        seen: alreadySeen,
      });

      if (!grouped[s.userId].latestAt || s.createdAt > grouped[s.userId].latestAt) {
        grouped[s.userId].latestAt = s.createdAt;
      }
    });

  // Sort: unseen first, then by latestAt desc
  const feed = Object.values(grouped).sort((a, b) => {
    if (a.allSeen !== b.allSeen) return a.allSeen ? 1 : -1;
    return new Date(b.latestAt) - new Date(a.latestAt);
  });
  console.log('feed', feed);
  return res.json({ data: feed });
}

// ─── Get my statuses ──────────────────────────────────────────────────────────
// GET /api/statuses/me
function getMyStatuses(req, res) {
  const currentUserId = req.user.userId;
  const db = readDB();

  if (!db.statuses) return res.json({ data: [] });

  const mine = stripExpired(db.statuses)
    .filter((s) => s.userId === currentUserId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return res.json({ data: mine });
}

// ─── View a status (mark as seen) ────────────────────────────────────────────
// POST /api/statuses/:statusId/view
function viewStatus(req, res) {
  const currentUserId = req.user.userId;
  const { statusId } = req.params;
  const db = readDB();

  if (!db.statuses) return res.status(404).json({ error: 'Status not found' });

  const idx = db.statuses.findIndex((s) => s.id === statusId);
  if (idx === -1) return res.status(404).json({ error: 'Status not found' });

  const status = db.statuses[idx];

  if (isExpired(status.createdAt)) {
    return res.status(410).json({ error: 'This status has expired' });
  }

  // Don't record owner viewing own status
  if (status.userId === currentUserId) {
    return res.json({ ok: true });
  }

  const alreadyViewed = status.viewers.some((v) => v.userId === currentUserId);
  const viewer = db.users.find((u) => u.id === currentUserId);

  if (!alreadyViewed) {
    db.statuses[idx].viewers.push({
      userId: currentUserId,
      username: viewer?.username,
      name: viewer?.name,
      viewedAt: new Date().toISOString(),
    });

    writeDB(db);
  }

  return res.json({ ok: true });
}

// ─── Get viewers of a status (owner only) ────────────────────────────────────
// GET /api/statuses/:statusId/viewers
function getStatusViewers(req, res) {
  const currentUserId = req.user.userId;
  const { statusId } = req.params;
  const db = readDB();

  if (!db.statuses) return res.status(404).json({ error: 'Status not found' });

  const status = db.statuses.find((s) => s.id === statusId);
  if (!status) return res.status(404).json({ error: 'Status not found' });

  if (status.userId !== currentUserId) {
    return res.status(403).json({ error: 'You can only see viewers of your own statuses' });
  }

  const viewers = status.viewers.map((v) => {
    const user = db.users.find((u) => u.id === v.userId);
    return {
      userId: v.userId,
      username: user?.username || 'Unknown',
      name: user?.name || 'Unknown',
      viewedAt: v.viewedAt,
    };
  });

  return res.json({ data: viewers, total: viewers.length });
}

// ─── Delete a status ──────────────────────────────────────────────────────────
// DELETE /api/statuses/:statusId
function deleteStatus(req, res) {
  const currentUserId = req.user.userId;
  const { statusId } = req.params;
  const db = readDB();

  if (!db.statuses) return res.status(404).json({ error: 'Status not found' });

  const idx = db.statuses.findIndex((s) => s.id === statusId);
  if (idx === -1) return res.status(404).json({ error: 'Status not found' });

  const status = db.statuses[idx];

  if (status.userId !== currentUserId) {
    return res.status(403).json({ error: 'You can only delete your own statuses' });
  }

  // Remove media file from disk if present
  if (status.file?.url) {
    const { deleteFileFromDisk } = require('../utils/fileUtils');
    deleteFileFromDisk(status.file.url);
  }

  db.statuses.splice(idx, 1);
  writeDB(db);

  return res.json({ ok: true, statusId });
}

// ─── Cleanup expired statuses (called internally or via cron) ─────────────────
// DELETE /api/statuses/cleanup  (admin / internal)
function cleanupExpiredStatuses(req, res) {
  const db = readDB();

  if (!db.statuses) return res.json({ deleted: 0 });

  const { deleteFileFromDisk } = require('../utils/fileUtils');

  const before = db.statuses.length;
  const expired = db.statuses.filter((s) => isExpired(s.createdAt));

  expired.forEach((s) => {
    if (s.file?.url) deleteFileFromDisk(s.file.url);
  });

  db.statuses = db.statuses.filter((s) => !isExpired(s.createdAt));
  writeDB(db);

  return res.json({ deleted: before - db.statuses.length });
}

module.exports = {
  postStatus,
  getStatusFeed,
  getMyStatuses,
  viewStatus,
  getStatusViewers,
  deleteStatus,
  cleanupExpiredStatuses,
};
