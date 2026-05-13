require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { socketHandler, getOnlineUsers } = require('./socket/socketHandler');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});

app.use(cors());

app.use(express.json());

app.use('/api', authRoutes);

app.use('/api', userRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/admin', adminRoutes(getOnlineUsers));

// Socket handler
socketHandler(io);

const PORT = process.env.PORT || 3000;

const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});
