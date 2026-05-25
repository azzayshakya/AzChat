const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const { readDB, writeDB } = require('../models/db');

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
  // Socket JWT authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication failed'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const currentUserId = socket.user.userId;

    console.log('🟢 Connected:', socket.id);

    // Initialize socket set
    if (!onlineUsers[currentUserId]) {
      onlineUsers[currentUserId] = new Set();
    }

    // Store socket
    onlineUsers[currentUserId].add(socket.id);

    // Reverse mapping
    socketToUserMap[socket.id] = currentUserId;

    // Join personal room
    socket.join(currentUserId);

    // Update online status in DB
    const db = readDB();

    const user = db.users.find((u) => u.id === currentUserId);

    if (user) {
      user.isOnline = true;
      writeDB(db);
    }

    // Emit online users
    io.emit('online_users', Object.keys(onlineUsers));

    // Typing start
    socket.on('typing_start', ({ receiverId }) => {
      io.to(receiverId).emit('typing_start', {
        userId: currentUserId,
      });
    });

    // Typing stop
    socket.on('typing_stop', ({ receiverId }) => {
      io.to(receiverId).emit('typing_stop', {
        userId: currentUserId,
      });
    });

    // Send message
    socket.on('send_message', ({ receiverId, text }, callback) => {
      try {
        // Validation
        if (!text?.trim()) {
          return callback?.({
            ok: false,
            error: 'Message required',
          });
        }

        if (text.length > 1000) {
          return callback?.({
            ok: false,
            error: 'Message too long',
          });
        }

        const db = readDB();

        // Create chatId
        const chatId = [currentUserId, receiverId].sort().join('_');

        // Delivery status
        const status = onlineUsers[receiverId] ? 'delivered' : 'sent';

        const msg = {
          id: crypto.randomUUID(),

          chatId,

          senderId: currentUserId,

          receiverId,

          text: text.trim(),

          status,

          isRead: false,

          editedAt: null,

          deletedAt: null,

          seenAt: null,

          createdAt: new Date().toISOString(),
        };

        db.messages.push(msg);

        writeDB(db);

        // Emit to sender
        io.to(currentUserId).emit('new_message', msg);

        // Emit to receiver
        io.to(receiverId).emit('new_message', msg);

        // Ack callback
        callback?.({
          ok: true,
          data: msg,
        });
      } catch (error) {
        console.error(error);

        callback?.({
          ok: false,
          error: 'Failed to send message',
        });
      }
    });

    // Read receipts
    socket.on('messages_seen', ({ chatId, senderId }) => {
      const db = readDB();

      db.messages = db.messages.map((m) => {
        if (m.chatId === chatId && m.senderId === senderId && m.receiverId === currentUserId) {
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

      // Notify sender
      io.to(senderId).emit('messages_seen', {
        chatId,

        seenBy: currentUserId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userId = socketToUserMap[socket.id];

      console.log('🔴 Disconnected:', socket.id);

      if (userId && onlineUsers[userId]) {
        onlineUsers[userId].delete(socket.id);

        // Remove empty sets
        if (onlineUsers[userId].size === 0) {
          delete onlineUsers[userId];

          // Update last seen
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

module.exports = {
  socketHandler,
  getOnlineUsers,
};
