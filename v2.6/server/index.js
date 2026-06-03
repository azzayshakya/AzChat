require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statusRoutes = require('./routes/statusRoutes');
require('./utils/dbCleanup.js');

const { socketHandler, getOnlineUsers } = require('./socket/socketHandler');
const requestLogger = require('./middleware/requestLogger.js');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*' },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve uploaded files as static assets ────────────────────────────────────
// Any WLAN device can access:  http://<your-ip>:3000/uploads/images/filename.webp
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', groupRoutes);
app.use('/api', statusRoutes);
app.use('/api/admin', adminRoutes(getOnlineUsers));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Chat Backend API',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
  });
});
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'File too large. Max size is 10MB' });
  if (err.message?.startsWith('File type not allowed'))
    return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Socket ───────────────────────────────────────────────────────────────────
socketHandler(io);

const PORT = process.env.PORT || 7001;

const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running`);
  console.log(`   Local:   ${HOST}:${PORT}`);
});
