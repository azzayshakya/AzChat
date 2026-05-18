const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { readDB, writeDB } = require('../models/db');
const { isGroupMember } = require('../utils/groupUtils');

// userId -> Set(socketIds)
const onlineUsers = {};

// socketId -> userId
const socketToUserMap = {};

function getOnlineUsers() {
  return onlineUsers;
}

function getUserSocketIds(userId) {
  return onlineUsers[userId] ? Array.from(onlineUsers[userId]) : [];
}

function socketHandler(io) {
  // ─── JWT auth middleware ────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication failed'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection ─────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const currentUserId = socket.user.userId;
    console.log('🟢 Connected:', socket.id, '| User:', currentUserId);

    // Track socket
    if (!onlineUsers[currentUserId]) onlineUsers[currentUserId] = new Set();
    onlineUsers[currentUserId].add(socket.id);
    socketToUserMap[socket.id] = currentUserId;

    // Personal room
    socket.join(currentUserId);

    // Auto-join all group rooms this user belongs to
    const db = readDB();
    const userGroupIds = db.groupMembers
      .filter((gm) => gm.userId === currentUserId)
      .map((gm) => gm.groupId);
    userGroupIds.forEach((gId) => socket.join(`group:${gId}`));

    // Update online status
    const user = db.users.find((u) => u.id === currentUserId);
    if (user) {
      user.isOnline = true;
      writeDB(db);
    }

    io.emit('online_users', Object.keys(onlineUsers));

    // ─── Direct message ───────────────────────────────────────────────────────
    socket.on('send_message', ({ receiverId, text }, callback) => {
      try {
        if (!text?.trim()) return callback?.({ ok: false, error: 'Message required' });
        if (text.length > 2000)
          return callback?.({ ok: false, error: 'Message too long (max 2000 chars)' });
        if (!receiverId) return callback?.({ ok: false, error: 'receiverId required' });

        const db = readDB();

        const chatId = [currentUserId, receiverId].sort().join('_');
        const status = onlineUsers[receiverId] ? 'delivered' : 'sent';

        const msg = {
          id: crypto.randomUUID(),
          chatId,
          chatType: 'direct',
          senderId: currentUserId,
          receiverId,
          text: text.trim(),
          file: null,
          status,
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

        // Emit to both parties
        io.to(currentUserId).emit('new_message', msg);
        io.to(receiverId).emit('new_message', msg);

        callback?.({ ok: true, data: msg });
      } catch (error) {
        console.error('[send_message]', error);
        callback?.({ ok: false, error: 'Failed to send message' });
      }
    });

    // ─── Group message ────────────────────────────────────────────────────────
    socket.on('send_group_message', ({ groupId, text }, callback) => {
      try {
        if (!text?.trim()) return callback?.({ ok: false, error: 'Message required' });
        if (text.length > 2000) return callback?.({ ok: false, error: 'Message too long' });
        if (!groupId) return callback?.({ ok: false, error: 'groupId required' });

        if (!isGroupMember(groupId, currentUserId)) {
          return callback?.({ ok: false, error: 'You are not a member of this group' });
        }

        const db = readDB();

        const msg = {
          id: crypto.randomUUID(),
          chatId: groupId,
          chatType: 'group',
          senderId: currentUserId,
          receiverId: null,
          groupId,
          text: text.trim(),
          file: null,
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

        // Broadcast to all members in group room
        io.to(`group:${groupId}`).emit('new_group_message', msg);

        callback?.({ ok: true, data: msg });
      } catch (error) {
        console.error('[send_group_message]', error);
        callback?.({ ok: false, error: 'Failed to send group message' });
      }
    });

    // ─── Edit message ─────────────────────────────────────────────────────────
    socket.on('edit_message', ({ messageId, text }, callback) => {
      try {
        if (!text?.trim()) return callback?.({ ok: false, error: 'Text required' });

        const db = readDB();
        const msgIdx = db.messages.findIndex((m) => m.id === messageId);

        if (msgIdx === -1) return callback?.({ ok: false, error: 'Message not found' });
        const msg = db.messages[msgIdx];
        if (msg.senderId !== currentUserId) {
          return callback?.({ ok: false, error: "Cannot edit others' messages" });
        }
        if (msg.deletedAt) return callback?.({ ok: false, error: 'Message was deleted' });

        db.messages[msgIdx] = { ...msg, text: text.trim(), editedAt: new Date().toISOString() };
        writeDB(db);

        const updated = db.messages[msgIdx];

        if (msg.chatType === 'group') {
          io.to(`group:${msg.groupId}`).emit('message_edited', updated);
        } else {
          io.to(currentUserId).emit('message_edited', updated);
          io.to(msg.receiverId).emit('message_edited', updated);
        }

        callback?.({ ok: true, data: updated });
      } catch (error) {
        console.error('[edit_message]', error);
        callback?.({ ok: false, error: 'Failed to edit message' });
      }
    });

    // ─── Delete message via socket ────────────────────────────────────────────
    socket.on('delete_message', ({ messageId, deleteFor }, callback) => {
      try {
        const db = readDB();
        const msgIdx = db.messages.findIndex((m) => m.id === messageId);

        if (msgIdx === -1) return callback?.({ ok: false, error: 'Message not found' });
        const msg = db.messages[msgIdx];
        if (msg.senderId !== currentUserId) {
          return callback?.({ ok: false, error: "Cannot delete others' messages" });
        }

        if (deleteFor === 'everyone') {
          db.messages[msgIdx] = {
            ...msg,
            text: null,
            file: null,
            deletedAt: new Date().toISOString(),
            deletedFor: 'everyone',
          };

          if (msg.chatType === 'group') {
            io.to(`group:${msg.groupId}`).emit('message_deleted', {
              messageId,
              deletedFor: 'everyone',
            });
          } else {
            io.to(currentUserId).emit('message_deleted', { messageId, deletedFor: 'everyone' });
            io.to(msg.receiverId).emit('message_deleted', { messageId, deletedFor: 'everyone' });
          }
        } else {
          // Delete for self only
          const deletedForUsers = msg.deletedForUsers || [];
          if (!deletedForUsers.includes(currentUserId)) deletedForUsers.push(currentUserId);
          db.messages[msgIdx] = { ...msg, deletedForUsers };

          socket.emit('message_deleted', { messageId, deletedFor: 'me' });
        }

        writeDB(db);
        callback?.({ ok: true });
      } catch (error) {
        console.error('[delete_message]', error);
        callback?.({ ok: false, error: 'Failed to delete message' });
      }
    });

    // ─── Read receipts ────────────────────────────────────────────────────────
    socket.on('messages_seen', ({ chatId, senderId }) => {
      const db = readDB();

      db.messages = db.messages.map((m) => {
        if (m.chatId === chatId && m.senderId === senderId && m.receiverId === currentUserId) {
          return { ...m, status: 'seen', isRead: true, seenAt: new Date().toISOString() };
        }
        return m;
      });

      writeDB(db);

      io.to(senderId).emit('messages_seen', { chatId, seenBy: currentUserId });
    });

    // ─── Typing indicators ────────────────────────────────────────────────────
    socket.on('typing_start', ({ receiverId, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit('typing_start', { userId: currentUserId, groupId });
      } else if (receiverId) {
        io.to(receiverId).emit('typing_start', { userId: currentUserId });
      }
    });

    socket.on('typing_stop', ({ receiverId, groupId }) => {
      if (groupId) {
        socket.to(`group:${groupId}`).emit('typing_stop', { userId: currentUserId, groupId });
      } else if (receiverId) {
        io.to(receiverId).emit('typing_stop', { userId: currentUserId });
      }
    });

    // ─── Group events (join/leave notifications via socket) ───────────────────
    socket.on('join_group_room', ({ groupId }) => {
      if (isGroupMember(groupId, currentUserId)) {
        socket.join(`group:${groupId}`);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userId = socketToUserMap[socket.id];
      console.log('🔴 Disconnected:', socket.id);

      if (userId && onlineUsers[userId]) {
        onlineUsers[userId].delete(socket.id);

        if (onlineUsers[userId].size === 0) {
          delete onlineUsers[userId];

          const db = readDB();
          const user = db.users.find((u) => u.id === userId);
          if (user) {
            user.isOnline = false;
            user.lastSeen = new Date().toISOString();
            writeDB(db);
          }
        }
      }

      delete socketToUserMap[socket.id];
      io.emit('online_users', Object.keys(onlineUsers));
    });
  });
}

module.exports = { socketHandler, getOnlineUsers, getUserSocketIds };
